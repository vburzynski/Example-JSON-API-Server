// test/setup.js
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const chaiMatchPattern = require('chai-match-pattern');
const path = require('path');
const { factory, MongooseAdapter } = require('factory-girl');
const Chance = require('chance');
const supertest = require('supertest');
const debug = require('debug')('test:setup');

const jsonapi = require('./support/jsonapi');
const db = require('./support/database');
const setupUserFactory = require('./support/factories/setup-user-factory');

const Server = require('../api/server.js');

before(async function () {
  debug('setting up chai');
  chai.use(sinonChai);
  chai.use(chaiAsPromised);
  chai.use(chaiMatchPattern);

  debug('creating supertest instance');
  const port = process.env.PORT || 10010;
  this.request = supertest(`localhost:${port}`);

  debug('connecting to db');
  await db.connect();

  debug('creating app instance');
  this.server = new Server({
    appRoot: path.join(__dirname, '../'),
  });
  await this.server.init();

  debug('creating mongoose adapter for factory-girl');
  const adapter = new MongooseAdapter();
  factory.setAdapter(adapter);

  // TODO -- should models and schemas used in tests come from the app???

  debug('setting up factories');
  this.chance = new Chance();
  this.models = this.server.express.get('models');
  setupUserFactory(this.models, this.chance);

  debug('setting up json api serializers');
  this.schemas = this.server.express.get('schemas');
  this.swagger = this.server.express.get('swagger');
  jsonapi.init(this.swagger, this.schemas);
});

beforeEach(async function () {
  debug('create sinon sandbox');
  this.sandbox = sinon.createSandbox();
});

afterEach(async function () {
  debug('restore sinon sandbox');
  this.sandbox.restore();

  debug('clear collections');
  await db.clear();
});

after(async function () {
  debug('disconnecting tests db connection');
  db.disconnect();

  debug('diconnecting app db connection');
  this.server.stop();
});
