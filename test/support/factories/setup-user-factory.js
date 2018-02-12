const { factory } = require('factory-girl');

module.exports = (models, chance) => {
  factory.define('user', models.User, {
    username: chance.email(),
    firstName: chance.first(),
    lastName: chance.last(),
  });
};
