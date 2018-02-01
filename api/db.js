const bluebird = require('bluebird');
const config = require('config');
const config = require('config');
const fs = require('fs');
const mongoose = require('mongoose');
const swaggerMongoose = require('swagger-mongoose');
const YAML = require('yamljs');

module.exports = {
  isConnected: false,
  connection: null,
  models: {},
  schemas: {},

  connect: function connect() {
    // return active connection if one exists
    if (this.isConnected && this.connection) {
      return this.connection;
    }

    // use bluebird instead
    mongoose.Promise = bluebird;

    // connect to mongoose/mongodb
    if (mongoose.connection.readyState === 0) {
      if (process.env.NODE_ENV === 'test') {
        mongoose.connect(config.db.test);
      } else {
        mongoose.connect(config.db.prod);
      }
    }
    this.connection = mongoose.connection;
    this.connection.on('error', console.error.bind(console, 'connection error:'));

    // load api schema
    const swaggerFile = config.get('swaggerFile');
    const yaml = fs.readFileSync(swaggerFile, 'utf8');
    const spec = YAML.parse(yaml);
    this.swagger = spec;

    // compile swagger mongoose
    const { models, schemas } = swaggerMongoose.compile(spec);
    this.models = models;
    this.schemas = schemas;

    // done - we're connected
    this.isConnected = true;
    return this.connection;
  },
};
