// test/integration/routes/users/delete-user-by-id.spec.js
const moment = require('moment');
const { expect } = require('chai');
const { factory } = require('factory-girl');
const debug = require('debug')('test'); // eslint-disable-line

const validTimestamp = value => moment(value, moment.ISO_8601, true).isValid();

describe('DELETE /users/:id', () => {
  let user;
  let userModel;
  before(function () {
    userModel = this.models.User;
  });
  context('Given a User', function () {
    beforeEach(async () => {
      user = await factory.create('user');
    });
    it('should remove the user', async function () {
      const response = await this.request
        .delete(`/users/${user.id}`);

      // route should return the users in the response body
      expect(response.error).to.be.false;
      expect(response.status).to.equal(200);
      expect(response.body).to.exist;

      // check that data is correct:
      const { data } = response.body;
      expect(data).to.exist;
      expect(data).to.matchPattern({
        type: 'users',
        id: user.id,
        attributes: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          updatedAt: validTimestamp,
          createdAt: validTimestamp,
        },
      });

      // it should also not be in the database
      const record = await userModel.findById(user.id).exec();
      expect(record).to.not.exist;
    });
  });
});
