// api/repositories/user-repository.js
const Repository = require('./repository');
const debug = require('debug')('api:repos:user');

// TODO: automate generating these from mongoose models that are generated??
class UserRepository extends Repository {
  constructor(db) {
    debug('constructor');
    super('user', db);
  }
}

module.exports = UserRepository;
