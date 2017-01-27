const db = require('./db');
const Promise = require("bluebird");

const pool = db.pool();

/**
 * Parses an XML objected obtained from the Board Game Geek API
 * and persists it and it's relationships to storage.
 */
class Game {
  constructor() {
    this.id;
    this.type;
    this.name;
    this.names;
    this.thumbnail;
    this.image;
    this.description;
    this.min_players;
    this.max_players;
    this.play_time;
    this.year_published;
    this.min_age;
    this.stats_user_rated;
    this.stats_average;
    this.stats_bayes_average;
    this.stats_owned;
    this.stats_trading;
    this.stats_wanting;
    this.stats_wishing;
    this.stats_num_comments;
    this.names = [];
    this.ranks = [];
    this.links = [];
  }

  /**
   * Parses data out of an xml2js object for a single game.
   */
  parseFromXmlData(data) {
    // Extract basic values
    this.id = data.$.id;
    this.type = data.$.type;
    this.thumbnail = data.thumbnail && data.thumbnail[0];
    this.image = data.image && data.image[0];
    this.description = data.description && data.description[0];
    this.year_published = data.yearpublished[0].$.value;
    this.min_players = data.minplayers[0].$.value;
    this.max_players = data.maxplayers[0].$.value;
    this.play_time = data.playingtime[0].$.value;
    this.min_age = data.minage[0].$.value;

    // Extract stats
    const stats = data.statistics[0].ratings[0];
    this.stats_user_rated = stats.usersrated[0].$.value;
    this.stats_average = stats.average[0].$.value;
    this.stats_bayes_average = stats.bayesaverage[0].$.value;
    this.stats_owned = stats.owned[0].$.value;
    this.stats_trading = stats.trading[0].$.value;
    this.stats_wanting = stats.wanting[0].$.value;
    this.stats_wishing = stats.wishing[0].$.value;
    this.stats_num_comments = stats.numcomments[0].$.value;

    // Extract links
    this.links = [];
    data.link.forEach(link => {
      const type = link.$.type;
      const id = link.$.id;
      const value = link.$.value;
      this.links.push({id, type, value});
    });

    // Extract names
    this.names = [];
    data.name.forEach(nameObj => {
      const type = nameObj.$.type;
      const value = nameObj.$.value;
      if (type == 'primary') {
        this.name = value;
      }
      this.names.push({type, value});
    });

    // Extract ranks
    const rawRanks = stats.ranks[0].rank;
    this.ranks = [];
    rawRanks.forEach(rank => {
      const type = rank.$.type;
      const id = rank.$.id;
      const rankName = rank.$.name;
      const friendlyName = rank.$.friendlyname;
      const value = rank.$.value;
      this.ranks.push({type, id, rankName, friendlyName, value});
    });
  }

  /**
   * Saves a game and all its relationships to the database.
   */
  save() {
    return this.saveGame_()
      .then(() => this.saveRanks_())
      .then(() => this.saveLinks_())
      .then(() => this.saveNames_())
      .catch(error => {
        console.error(error);
        return Promise.reject(error);
      });
  }

  saveGame_() {
    const params = {
      id: this.id,
      type: this.type,
      name: this.name,
      thumbnail: this.thumbnail,
      image: this.image,
      description: this.description,
      min_players: this.min_players,
      max_players: this.max_players,
      play_time: this.play_time,
      year_published: this.year_published,
      min_age: this.min_age,
      stats_user_rated: this.stats_user_rated,
      stats_average: this.stats_average,
      stats_bayes_average: this.stats_bayes_average,
      stats_owned: this.stats_owned,
      stats_trading: this.stats_trading,
      stats_wanting: this.stats_wanting,
      stats_wishing: this.stats_wishing,
      stats_num_comments: this.stats_num_comments,
    };

    return pool.query('INSERT IGNORE INTO `bg_game` SET ?', params);
  }

  saveRanks_() {
    let promises = this.ranks.map(rank => {
      return pool.query('INSERT IGNORE INTO `bg_ranked_list` SET ?', {
        id: rank.id,
        name: rank.rankName,
        friendly_name: rank.friendlyName,
        type: rank.type,
      }).then(() => {
        pool.query('INSERT IGNORE INTO `bg_ranked_list_to_game` SET ?', {
          ranked_list_id: rank.id,
          game_id: this.id,
          rank: rank.value,
        });
      });
    });

    return Promise.all(promises);
  }

  saveNames_() {
    let promises = this.names.map(name => {
      return pool.query('INSERT IGNORE INTO `bg_alt_game_name` SET ?', {
        game_id: this.id,
        name: name.value,
        type: name.type,
      })
    });

    return Promise.all(promises);
  }

  saveLinks_() {
    let promises = this.links.map(link => {
      // DESIGNER
      if (link.type == 'boardgamedesigner') {
        return pool.query('INSERT IGNORE INTO `bg_designer` SET ?', {
          id: link.id, name: link.value,
        }).then(() => {
          pool.query('INSERT IGNORE INTO `bg_designer_to_game` SET ?', {
            designer_id: link.id, game_id: this.id,
          });
        });
      } 
      
      // ARTIST
      else if (link.type == 'boardgameartist') {
        return pool.query('INSERT IGNORE INTO `bg_artist` SET ?', {
          id: link.id, name: link.value,
        }).then(() => {
          pool.query('INSERT IGNORE INTO `bg_artist_to_game` SET ?', {
            artist_id: link.id, game_id: this.id,
          });
        });
      }
      
      // EXPANSION
      else if (link.type == 'boardgameexpansion') {
        return pool.query('INSERT IGNORE INTO `bg_game_to_expansion` SET ?', {
          expansion_id: link.id, game_id: this.id
        });
      }
      
      // MECHANIC
      else if (link.type == 'boardgamemechanic') {
        return pool.query('INSERT IGNORE INTO `bg_mechanic` SET ?', {
          id: link.id, name: link.value,
        }).then(() => {
          pool.query('INSERT IGNORE INTO `bg_mechanic_to_game` SET ?', {
            mechanic_id: link.id, game_id: this.id,
          });
        });
      }
      
      // CATEGORY
      else if (link.type == 'boardgamecategory') {
        return pool.query('INSERT IGNORE INTO `bg_category` SET ?', {
          id: link.id, name: link.value,
        }).then(() => {
          pool.query('INSERT IGNORE INTO `bg_category_to_game` SET ?', {
            category_id: link.id, game_id: this.id,
          });
        });

      }
      
      // FAMILY
      else if (link.type == 'boardgamefamily') {
        return pool.query('INSERT IGNORE INTO `bg_family` SET ?', {
          id: link.id, name: link.value,
        }).then(() => {
          pool.query('INSERT IGNORE INTO `bg_family_to_game` SET ?', {
            family_id: link.id, game_id: this.id,
          });
        });
      }
      
      // PUBLISHER
      else if (link.type == 'boardgamepublisher') {
        return pool.query('INSERT IGNORE INTO `bg_publisher` SET ?', {
          id: link.id, name: link.value,
        }).then(() => {
          pool.query('INSERT IGNORE INTO `bg_publisher_to_game` SET ?', {
            publisher_id: link.id, game_id: this.id,
          });
        });
      }
    });

    return Promise.all(promises);
  }
}

module.exports = Game;
