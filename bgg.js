/** @fileoverview Fetchs data from the board game geek xml api. */

const https = require('https');
const xml2js = require('xml2js');
const Promise = require("bluebird");

const URL = 'https://www.boardgamegeek.com/xmlapi2/thing?type=boardgame&stats=1&id=';
const parser = new xml2js.Parser();

/**
 * Downloads data on a batch of board games. Returns a promise for An
 * xml2js object of the response. Rejects if there is an invalid or
 * error response from Board Game Geek.
 * 
 * WARNING: When requesting a batch, Board Game Geek will reject the entire
 * batch if at least one item in the batch is a deleted game.
 * 
 * @param {!Array<number>} ids An array of board game ids to download
 * @return {!Promise<!Object>} parsed response
 */
function fetchGames(ids) {
  return new Promise((resolve, reject) => {
    const url = URL + ids.join(',');
    https.get(url, r => {
      let xml = '';
      r.on('data', chunk => xml += chunk)
      r.on('end', () => {
        parse(xml, url).then(items => resolve(items), reject);
      });
    });
  });
}

/**
 * Fetches a single game. See {@code fetchGames}
 */
function fetchGame(id) {
  return fetchGames([id]).then(items => items ? items[0] : null);
}

/**
 * Parses the xml string into an xml object.
 */
function parse(xml, url) {
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      if (!result || !result.items) {
        reject('Recieved a bad response (' + url + ') : ' + xml);
      }

      resolve(result.items.item || []);
    });
  });
}

exports.fetchGame = fetchGame;
exports.fetchGames = fetchGames;
