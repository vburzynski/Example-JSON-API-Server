// api/db.js
const _ = require('lodash');
const config = require('config');
const fs = require('fs');
const mongoose = require('mongoose');
const swaggerMongoose = require('swagger-mongoose');
const YAML = require('yamljs');

const debug = require('debug')('api:db');

const db = {
  isConnected: false,
  connection: null,
  models: null,
  schemas: null,

  connect: async () => {
    debug('connect');

    // return active connection if one exists
    if (db.isConnected && db.connection) {
      debug('returning connection');
      return db.connection;
    }

    if (_.get(mongoose, 'connection.readyState') === 0) {
      debug('creating connection', config.database);
      mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
      db.connection = mongoose.connection;
      db.connection.on('error', debug.bind(debug, 'connection error:'));
      db.connection.once('open', debug.bind(debug, 'connection open.'));
    } else {
      debug('using existing mongoose connection');
      db.connection = mongoose.connection;
    }

    if (!db.models && !db.schemas) {
      debug('parsing swagger schema');
      db.parseSwagger();
    }

    debug('connected');
    db.isConnected = true;
    return db.connection;
  },

  disconnect: async () => {
    debug('disconnect');
    if (db.isConnected) {
      debug('closing');
      await mongoose.connection.close();

      debug('closed');
      db.isConnected = false;
    }
  },

  parseSwagger: () => {
    debug('loading swagger yaml');
    const swaggerFile = config.get('swaggerFile');
    const yaml = fs.readFileSync(swaggerFile, 'utf8');
    const spec = YAML.parse(yaml);
    db.swagger = spec;

    debug('generating mongoose schemas and models');
    const { models, schemas } = swaggerMongoose.compile(spec);
    db.models = models;
    db.schemas = schemas;
  },
};

module.exports = db;
