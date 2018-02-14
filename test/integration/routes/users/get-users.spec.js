// test/integration/routes/users/get-users.spec.js
const _ = require('lodash');
const moment = require('moment');
const { expect } = require('chai');
const { factory } = require('factory-girl');
const debug = require('debug')('test'); // eslint-disable-line

const validTimestamp = value => moment(value, moment.ISO_8601, true).isValid();

describe('GET /users/', () => {
  let users;

  before(async function () {
    // create 5 records in the User collection
    users = await factory.createMany('user', 5);
  });

  context('Given a User collection with 5 users', function () {
    it('should return all 5 users', async function () {
      const response = await this.request
        .get('/users');

      // route should return the users in the response body
      expect(response.error).to.be.false;
      expect(response.status).to.equal(200);
      expect(response.body).to.exist;

      // construct an array of all user ids
      const userIds = _.map(users, user => user.id);

      // matcher function
      const matchesOneUserID = id => _.includes(userIds, id);

      // check that data is correct:
      const { data } = response.body;
      expect(data).to.be.an('array').that.is.lengthOf(5);
      data.forEach((item) => {
        expect(item).to.matchPattern({
          type: 'users',
          id: matchesOneUserID,
          attributes: {
            username: _.isString,
            firstName: _.isString,
            lastName: _.isString,
            updatedAt: validTimestamp,
            createdAt: validTimestamp,
          },
        });
      });
    });
  });
});
