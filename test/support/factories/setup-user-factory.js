// test/support/factories/setup-user-factory.js
const { factory } = require('factory-girl');

module.exports = (models, chance) => {
  factory.define('user', models.User, {
    username: chance.email.bind(chance),
    firstName: chance.first.bind(chance),
    lastName: chance.last.bind(chance),
  });
};
