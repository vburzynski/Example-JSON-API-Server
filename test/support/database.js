// test/support/database.js
const _ = require('lodash');
const mongoose = require('mongoose');
const config = require('config');
const debug = require('debug')('test:db');

const db = {
  connection: null,

  clear: () => {
    debug('clear db');
    if (db.connection) {
      const collections = Object.keys(db.connection.collections);
      collections.forEach(function (name) {
        debug(`clearing collection: ${name}`);
        const collection = db.connection.collections[name];
        collection.remove(function () {});
      });
    }
  },

  connect: async () => {
    debug('connect db');
    if (_.get(mongoose, 'connection.readyState') === 0) {
      mongoose.connect(config.database);
      db.connection = mongoose.connection;
      db.connection.on('error', debug.bind(debug, 'connection error:'));
      db.connection.once('open', debug.bind(debug, 'connection open.'));
    } else {
      db.connection = mongoose.connection;
    }
  },

  disconnect: () => {
    db.connection.close();
  },
};

module.exports = db;
