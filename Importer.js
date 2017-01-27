const db = require('./db');
const Game = require('./Game');
const bgg = require('./bgg');
const Promise = require("bluebird");

const pool = db.pool();

/**
 * The maximum number of concurrent HTTP connections to allow
 * to board game geek.
 */
const MAX_CONNECTIONS = 2;

/**
 * How long to wait between API requests.
 */
const WAIT_BETWEEN_REQUESTS_MS = 1000;

/**
 * How many board games to request data for at a time.
 */
const STARTING_BATCH_SIZE = 400;

/**
 * Imports Board Game details from Board Game Geek using the XMLv2 API
 * and stores the data into an a database. See schema.sql.
 * 
 * The importer works by using the batch API: requesting 400 games in
 * a single request, then saving. The importer starts at ID 1, and
 * works its way up. If the importer is interrupted, it will query
 * the database to find the highest game loaded so far, and pick up
 * where it left off.
 * 
 * This import process is complicated by the fact that Board Game Geeks
 * API will return an error if any one of the games in the batch request is
 * a deleted game. One bad game ruins the entire batch request. The importer
 * handles this by recursively splitting bad batches up and re-requesting them
 * via a work queue.
 * 
 * For example, a bad batch of 400 games with ids from [1-400] will result in
 * two follow up queries of [1-200] and [201-400]. If the query for [1-200]
 * were to fail again, the batch would be split again into [1-100] and [101-200].
 * This process continues until the specific bad ids can be isolated and
 * logged in the database so they are not requested again.
 */
class Importer {
    constructor() {
        this.queue = [];
        this.interval;
        this.activeBatches = new Set();
    }
    
    start() {
      console.log('Starting...');
      if (!this.interval) {
        this.interval = setInterval(() => this.process_(), WAIT_BETWEEN_REQUESTS_MS);
      }
    }

    stop() {
      this.interval && clearInterval(this.interval);
      this.interval = null;
    }

    process_() {
      if (this.activeBatches.size >= MAX_CONNECTIONS) {
        console.log('Too many active connections, not starting new one.');
        return;
      }

      this.getNextBatchOfIds_()
          .then(ids => this.importIds(ids));
    }

    importIds(ids) {
      this.activeBatches.add(ids);
      console.info('Requesting batch ' + this.batchToString_(ids));
      return bgg.fetchGames(ids)
          .then(xmlObjs => this.parseAndStoreGames_(xmlObjs, ids))
          .catch(err => this.handleImportFailure_(err, ids))
          .finally(() => this.activeBatches.delete(ids));
    }

    /**
     * Given a set of xml objs, converts them to Games and persist them
     * all to the database, recording the results as it goes. Returns
     * a promise that will resolve once all games and all of their relationships
     * have been stored.
     * @return {!Promise}
     */
    parseAndStoreGames_(xmlObjs, ids) {
      console.info('Recieved batch ' + this.batchToString_(ids));
      let promises = [];
      let recieved = new Set();

      xmlObjs.forEach(xmlObj => {
        let game = new Game();
        game.parseFromXmlData(xmlObj);
        recieved.add(game.id);
        promises.push(game.save());
      });

      ids.forEach(id => {
        let result = recieved.has(id.toString()) ? 'loaded' : 'empty';
        promises.push(this.recordResultOfImport_(id, result));
        //console.log(`Recording ${id} as ${result}`);
      });

      return Promise.all(promises);
    }

    handleImportFailure_(err, ids) {
      //console.warn(this.batchToString_(ids) + ': ' + err);

      // If only a single game failed, there was something wrong with that game.
      // Flag it the DB so we don't try it again and move on.
      // If a batch failed, it means 1 or more of the games in that batch had
      // an error (it only takes one corrupted game in BGG's database for their
      // API to refuse a batch request, even if the others are ok). To handle this,
      // we split the batch into two smaller batches and add them to the request
      // queue. Eventually by binary search the bad games will be narrowed down
      // and tagged while still letting us batch as many games as possible.
      if (ids.length == 1) {
        console.warn(`-------------------------------------------`);
        console.warn(`Game ${ids[0]} was bad and will be skipped!`);
        console.warn(`-------------------------------------------`);
        return this.recordResultOfImport_(ids[0], 'bad');
      } else {
        const start = ids[0];
        const end = ids[ids.length -1];
        console.warn(`Batch [${start}-${end}] was corrupt. Splitting batch...`);
        const batches = this.splitBatchOfIds_(ids);

        batches.reverse().forEach(batch => {
          this.queue.unshift(batch);
        });

        return Promise.resolve();
      }
    }

    importId(id) {
      return this.importIds([id]);
    }

    /**
     * @return {!Promise}
     */
    recordResultOfImport_(gameId, result) {
      return pool.query('REPLACE INTO `bg_imports` SET ?', {
        target_id: gameId,
        type: 'game',
        result: result,
      });
    }

    /**
     * Returns a range of ids to request next.
     * 
     * First checks the queue.
     * Next check if there is active work. If so, get the batch after the current one.
     * Lastly, fall back to asking the database where to start.
     * @return Promise<!Array<number>>
     */
    getNextBatchOfIds_() {
      if (this.queue.length > 0) {
        console.log('Getting batch from the queue...');
        return Promise.resolve(this.queue.shift());
      } else if (this.activeBatches.size > 0) {
        console.log('Getting batch that follows current work...');
        return this.getNextBatchOfIdsBasedOffActiveWork_();
      } else {
        console.log('Getting batch from the database...');
        return this.getNextBatchOfIdsFromDatabase_();
      }
    }

    /**
     * Returns a range of ids to request next based on requesting whatever comes
     * next after whatever is in progress now.
     */
    getNextBatchOfIdsBasedOffActiveWork_() {
      let batches = [...this.activeBatches];
      let ends = batches.map(batch => batch[batch.length-1]);

      let max = 0;
      ends.forEach(end => {
        if (end > max) max = end;
      });

      let nextBatch = this.buildArrayOfIds_(max + 1, STARTING_BATCH_SIZE);
      return Promise.resolve(nextBatch);
    }

    /**
     * Returns a range of ids to request next based on what was last stored in the database.
     * @return Promise<!Array<number>>
     */
    getNextBatchOfIdsFromDatabase_() {
      return this.getNextIdFromDatabase_().then(nextId => {
        return this.buildArrayOfIds_(nextId, STARTING_BATCH_SIZE);
      });
    }

    /**
     * Get the id of the next game to load based on the highest id stored in the db.
     */
    getNextIdFromDatabase_() {
      return pool.query('SELECT target_id FROM `bg_imports` ORDER BY target_id DESC LIMIT 1').then(rows => {
        return rows[0].target_id + 1;
      });
    }

    /**
     * Creates an array of integers, starting at {@code start} (inclusive)
     * and continuing for {@code size} items.
     */
    buildArrayOfIds_(start, size) {
      let ids = [];
      for (let i = 0; i < size; i++) {
        ids.push(start + i);
      }
      return ids;
    }

    /**
     * Split an array of ids into smaller batches.
     */
    splitBatchOfIds_(ids) {
      // Once you get down to 4 samples, just request each
      // individually - it is faster.
      if (ids.length <= 4) {
        return ids.map(id => [id]);
      }

      // Otherwise, split down the middle.
      let midpoint = Math.floor(ids.length / 2);
      let left = ids.slice(0, midpoint);
      let right = ids.slice(midpoint);
      return [left, right];
    }

    batchToString_(ids) {
      const start = ids[0];
      const end = ids[ids.length -1];
      return `[${start}-${end}](${ids.length})`;
    }
}

module.exports = Importer;
