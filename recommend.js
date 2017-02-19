const db = require('./db');
const Promise = require("bluebird");
const pool = db.pool();

getGameIds().then(ids => {

  // If first run, call setupData.
  // Aftewrads loadData can get normalized game attributes quicker.
  // setupData();

  loadData().then(data => {
    computeSimilar(ids, data);
  });
});

/**
 * Loads all known attributes of all known games. The DataSet is small, 
 * so we can get away with doing this in memory.
 * 
 * This returns a promise that resolves to an object map. The key is the
 * id of a game and the value is a Set of all known attributes for that game.
 * 
 * @return {Promise<{number: Set}>}
 */
function loadData() {
  return pool.query(`SELECT * FROM bg_game_attrs`).then(rows => {
    let data = {};
    rows.forEach(row => {
      let id = row.game_id;
      let attr = row.attr;

      if (!data[id]) {
        data[id] = new Set();
      }

      data[id].add(attr);
    });

    return data;
  });
}

/**
 * For each game, finds the top 10 games that are similar to it
 * by using the Jaccard distance. The top 10 games are persisted in the database.
 * 
 * Returns a promise that resolves when all data has been promised.
 * 
 * Note: This is slow and ineffecient because we are doing n^2 comparisons.
 * node.js isn't really the right tool for the job (Spark or another distributed
 * system would be better), but for playing with the concepts it is good enough.
 */
function computeSimilar(ids, data) {
  let promises = [];
  console.time('compute');

  // For each game, wait until a database connection becomes available.
  // Then hold the connection, calculate the closest N games, then persist.
  for (let id1 of ids) {
    promises.push(pool.getConnection().then(conn => {
      let ratings = [];
      let set1 = data[id1] || new Set();
      let savePromises = [];
      
      for (id2 of ids) {
        let set2 = data[id2] || new Set();
        let match = jaccardIndex(set1, set2);
        if (match > 0) {
          ratings.push({id: id2, match: match});
        }
      }

      ratings.sort((a, b) => b.match - a.match);
      ratings = ratings.slice(1, 11);

      for (let rating of ratings) {
        savePromises.push(conn.query('INSERT IGNORE INTO `bg_game_similar` SET ?', {
          game_id: id1, target_game_id: rating.id, match: rating.match,
        }));
      }

      return Promise.all(savePromises)
          .catch(e => console.warn(e))
          .finally(() => {
            pool.releaseConnection(conn);
          });
    }));
  }

  // Wait for all calculations to finish.
  Promise.all(promises).then(() => {
    console.timeEnd('compute');
  });
}

/**
 * Sets up a mysql table with game attributes denormalized into
 * a single table for faster lookups. Normally getting all the
 * attributes for a single game takes multiple queries, since the data
 * is stored in sql and not a document store.
 */
function setupData(ids) {
  return loadDataByTableJoins(ids).then(data => {
    storeData(data);
  });
}

/**
 * Stores all attributes for all games into a mysql table so it can
 * be looked up quicker for future calculations.
 */
function storeData(data) {
  console.log('Storing Data');
  console.time('store');

  let ids = Object.keys(data);
  let promises = [];

  for (let id of ids) {
    promises.push(pool.getConnection().then(conn => {
      let set = data[id];
      let attrs = [...set];
      let promises = [];

      for (let attr of attrs) {
        promises.push(conn.query('INSERT IGNORE INTO `bg_game_attrs` SET ?', {
          game_id: id, attr: attr,
        }));
      }

      return Promise.all(promises).then(() => {
        pool.releaseConnection(conn);
      })
    }));
  }

  return Promise.all(promises).then(() => {
    console.timeEnd('store');
  });
}

/**
 * Loads all details on all games by doing a series of table joins
 * for each game.
 * 
 * Returns a map of game id to Set, where the set has a series of
 * string for each unique attribute the game has.
 */
function loadDataByTableJoins(gameIds) {
  let dataByGameId = {};
  let promises = gameIds.map(id => {
    return getGameAttributes(id).then(d => dataByGameId[id] = d);
  });

  return Promise.all(promises).then(() => dataByGameId);
}

/**
 * Calculates the Jaccard Index between two sets.
 * 
 * This is a measure of how similar two sets are and is an approximation
 * of how similar two games are based on their attributes.
 * 
 * https://en.wikipedia.org/wiki/Jaccard_index
 */
function jaccardIndex(set1, set2) {
  const total = set1.size + set2.size;
  let intersection = 0;
  for(let i of set1 ) {
    if(set2.has(i)) {
      intersection++;
    }
  }
  var union = total - intersection;

  return union == 0 ? 0 : intersection / union;
}

/**
 * Returns a set of all the known attributes of a single game.
 * 
 * Under the hood, this is performing multiple sql joins to collect
 * all the data.
 */
function getGameAttributes(game_id) {

  return pool.getConnection().then(connection => {
    const promise = Promise.all([
      getMechanics(connection, game_id),
      getCategories(connection, game_id),
      getArtists(connection, game_id),
      getDesigners(connection, game_id),
      getFamilies(connection, game_id),
      getPublisher(connection, game_id)
    ]);

    return promise.then(sets => {
      const joined = new Set();
      for (let set of sets) {
        [...set].forEach(v => joined.add(v));
      }
      return joined;
    }).finally(() => pool.releaseConnection(connection));
  });
}

function getMechanics(connection, game_id) {
  return connection.query(`
      SELECT * FROM bg_mechanic
      INNER JOIN bg_mechanic_to_game
          ON bg_mechanic.id = bg_mechanic_to_game.mechanic_id
      WHERE game_id = ?`, [game_id])
      .then(results => new Set(results.map(i => `m_${i.id}`)));
}

function getCategories(connection, game_id) {
  return connection.query(`
      SELECT * FROM bg_category
      INNER JOIN bg_category_to_game
          ON bg_category.id = bg_category_to_game.category_id
      WHERE game_id = ?`, [game_id])
      .then(results => new Set(results.map(i => `c_${i.id}`)));
}

function getArtists(connection, game_id) {
  return connection.query(`
      SELECT * FROM bg_artist
      INNER JOIN bg_artist_to_game
          ON bg_artist.id = bg_artist_to_game.artist_id
      WHERE game_id = ?`, [game_id])
      .then(results => new Set(results.map(i => `a_${i.id}`)));
}

function getDesigners(connection, game_id) {
  return connection.query(`
      SELECT * FROM bg_designer
      INNER JOIN bg_designer_to_game
          ON bg_designer.id = bg_designer_to_game.designer_id
      WHERE game_id = ?`, [game_id])
      .then(results => new Set(results.map(i => `d_${i.id}`)));
}

function getFamilies(connection, game_id) {
  return connection.query(`
      SELECT * FROM bg_family
      INNER JOIN bg_family_to_game
          ON bg_family.id = bg_family_to_game.family_id
      WHERE game_id = ?`, [game_id])
      .then(results => new Set(results.map(i => `f_${i.id}`)));
}

function getPublisher(connection, game_id) {
  return connection.query(`
      SELECT * FROM bg_publisher
      INNER JOIN bg_publisher_to_game
          ON bg_publisher.id = bg_publisher_to_game.publisher_id
      WHERE game_id = ?`, [game_id])
      .then(results => new Set(results.map(i => `p_${i.id}`)));
}

function getGameIds() {
  return pool.query(`SELECT id FROM bg_game ORDER BY id ASC`).then(r => {
    return r.map(game => game.id);
  });
}

// SCRATH PAD:
// Shows the sample recommendations generated for a few games.

/**
 * 
select
   g1.name as game, 
   g1.id,
   g2.name as target,
   sim.match  
from (
  SELECT * from bg_game_similar
  ORDER BY game_id ASC
  LIMIT 100
) as sim
INNER JOIN bg_game as g1 ON sim.game_id = g1.id
INNER JOIN bg_game as g2 ON sim.target_game_id = g2.id
 */