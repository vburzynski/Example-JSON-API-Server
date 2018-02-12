const fs = require('fs');
const YAML = require('yamljs');
const mongoose = require('mongoose');
const swaggerMongoose = require('swagger-mongoose');
const debug = require('debug')('api');

mongoose.set('debug', true);

async function connect() {
  debug('connect');
  // const db = await mongoose.createConnection('mongodb://localhost/jsonapi_ember_demo_dev')
  //   .on('error', (err) => {
  //     console.log(err);
  //   })
  //   .once('open', () => {
  //     debug('connection opened');
  //   });

  mongoose.connect('mongodb://localhost/jsonapi_ember_demo_dev');
  mongoose.connection.on('error', err => debug(err));
  mongoose.connection.once('open', () => debug('conection open'));
  const db = mongoose.connection;

  debug('connection status:', db.readyState);

  const schema = new mongoose.Schema({
    name: 'string',
    size: 'string',
  });
  const Tank = mongoose.model('Tank', schema);


  const small = new Tank({ size: 'small' });
  small.save((err) => {
    if (err) debug('save err', err);
  });

  Tank.create({ size: 'small' }, (err, saved) => {
    if (err) debug('create err', err);
    debug('record', saved);
  });

  const swaggerFile = './api/swagger/swagger.yaml';
  const yaml = fs.readFileSync(swaggerFile, 'utf8');
  const spec = YAML.parse(yaml);

  debug('generating mongoose schemas and models');
  const { models, schemas } = swaggerMongoose.compile(spec);
  const { User } = models;

  debug('creating user');
  // const result = await models.User.create({
  //   username: 'ki@puz.vn',
  //   firstName: 'Rena',
  //   lastName: 'Ingram',
  // });
  const record = new User({
    username: 'ki@puz.vn',
    firstName: 'Rena',
    lastName: 'Ingram',
  });
  debug('new record', record);

  // const result = await record.save();
  // debug('result of save', result);

  record.save((err, saved) => {
    if (err) {
      return console.error(err);
    }
    debug('saved record', saved);
  });
}

debug('starting');
connect()
  .then(() => debug('done'))
  .catch(err => debug('error', err));
