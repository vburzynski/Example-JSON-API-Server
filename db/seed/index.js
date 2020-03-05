const _ = require('lodash');
const fs = require('fs');
const YAML = require('yamljs');
const mongoose = require('mongoose');
const swaggerMongoose = require('swagger-mongoose');
const debug = require('debug')('seed');
const Chance = require('chance');
const { factory } = require('factory-girl');
const setupUserFactory = require('../../test/support/factories/setup-user-factory');

mongoose.set('debug', true);

async function seed() {
  debug('connecting to DB');
  await mongoose.connect('mongodb://localhost/jsonapi_ember_demo_dev');
  mongoose.connection.on('error', err => debug(err));
  mongoose.connection.once('open', () => debug('conection open'));

  const db = mongoose.connection;
  debug('connection status:', db.readyState);

  if (db && process.env.CLEAR_DB === 'true') {
    debug('clearing db');
    const collections = await mongoose.connection.db.collections();
    const actions = [];
    _.each(collections, (collection) => {
      debug(`clearing ${collection.collectionName}`);
      actions.push(collection.deleteMany({}));
    });
    await actions;
  }

  debug('loading swagger YAML');
  const swaggerFile = './api/swagger/swagger.yaml';
  const yaml = fs.readFileSync(swaggerFile, 'utf8');
  const spec = YAML.parse(yaml);

  debug('generating mongoose schemas and models');
  const { models } = swaggerMongoose.compile(spec);

  debug('setting up factories');
  const chance = new Chance();
  setupUserFactory(models, chance);

  debug('populating with sample users');
  await factory.createMany('user', 5);

  debug('closing connection');
  mongoose.connection.close();
}

debug('initiating seeding of database.');
seed()
  .then(() => debug('complete'))
  .catch((err) => {
    debug('error!', err);
    mongoose.connection.close();
  });
