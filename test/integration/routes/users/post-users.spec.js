// test/integration/routes/users/post-users.spec.js
const _ = require('lodash');
const moment = require('moment');
const { expect } = require('chai');
const { factory } = require('factory-girl');
const { serializers } = require('../../../support/jsonapi');
const debug = require('debug')('test'); // eslint-disable-line

const validTimestamp = value => moment(value, moment.ISO_8601, true).isValid();

describe('POST /users/', () => {
  let user;
  let userModel;

  before(async function () {
    user = await factory.build('user');
    userModel = this.models.User;
  });

  context('given a new user', function () {
    it('inserts a new user', async function () {
      // POST user
      const response = await this.request
        .post('/users')
        .send(serializers.User(user));

      // route should return the user in the response body
      expect(response.error).to.be.false;
      expect(response.status).to.equal(201);
      expect(response.body).to.matchPattern({
        data: {
          type: 'users',
          id: _.isString,
          attributes: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            updatedAt: validTimestamp,
            createdAt: validTimestamp,
          },
        },
      });

      // it should also be in the database
      const id = _.get(response, 'body.data.id');
      const userRecord = await userModel.findById(id).exec();
      expect(userRecord).to.exist;
    });
  });
});
