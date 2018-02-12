const UserRepository = require('./user-repository');
const debug = require('debug')('api:repos');

const repos = {};

exports.repos = repos;

exports.init = (db) => {
  debug('initializing user repository');
  repos.user = new UserRepository(db);
};
