const SwaggerExpress = require('swagger-express-mw');
const express = require('express');
const db = require('./db');
const repositories = require('./repositories');
const { promisify } = require('util');
const debug = require('debug')('api');

class Server {
  constructor(config) {
    this.config = config;
  }

  async init() {
    debug('init');

    this.express = express();

    debug('creating swagger middleware');
    const swaggerExpress = await promisify(SwaggerExpress.create)(this.config);

    debug('registering swagger middleware');
    swaggerExpress.register(this.express);

    debug('connecting to the database');
    await db.connect();

    this.express.set('db', db);
    this.express.set('swagger', db.swagger);
    this.express.set('schemas', db.schemas);
    this.express.set('models', db.models);
    this.express.set('connection', db.connection);

    debug('init repositories');
    repositories.init(db);

    debug('start listening listening');
    const port = process.env.PORT || 10010;
    this.httpServer = this.express.listen(port);
  }

  stop() {
    this.httpServer.close();
    db.disconnect();
  }
}

module.exports = Server;
