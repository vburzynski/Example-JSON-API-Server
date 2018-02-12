const _ = require('lodash');
const moment = require('moment');
const { expect } = require('chai');
const { factory } = require('factory-girl');
const debug = require('debug')('test'); // eslint-disable-line

const validTimestamp = value => moment(value, moment.ISO_8601, true).isValid();

describe('GET /users/:id', () => {
  let users;
  let user;
  let userModel;
  before(async function () {
    // create 5 records in the User collection
    users = await factory.createMany('user', 5);

    // pick one of the users
    user = _.sample(users);

    userModel = this.models.User;
  });

  context('Given a User collection with 5 users', function () {
    it('should return the user whose id is specified', async function () {
      const response = await this.request
        .get(`/users/${user.id}`);

      // route should return the users in the response body
      expect(response.error).to.be.false;
      expect(response.status).to.equal(200);
      expect(response.body).to.exist;

      // check that data is correct:
      const { data } = response.body;
      expect(data).to.exist;
      expect(data).to.matchPattern({
        type: 'Users',
        id: user.id,
        attributes: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          updatedAt: validTimestamp,
          createdAt: validTimestamp,
        },
      });

      // it should also be in the database
      const record = await userModel.findById(user.id).exec();
      expect(record).to.exist;
    });
  });
});
