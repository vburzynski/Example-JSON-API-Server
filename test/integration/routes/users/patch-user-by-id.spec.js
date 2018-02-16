// test/integration/routes/users/patch-user-by-id.spec.js
const moment = require('moment');
const { expect } = require('chai');
const { factory } = require('factory-girl');
const debug = require('debug')('test'); // eslint-disable-line

const validTimestamp = value => moment(value, moment.ISO_8601, true).isValid();

describe('GET /users/:id', () => {
  let user;
  let chance;
  let userModel;
  before(async function () {
    ({ chance } = this);
    user = await factory.create('user');
    userModel = this.models.User;
  });

  context('Given a User', function () {
    it('should update the user', async function () {
      const updates = {
        data: {
          type: 'users',
          attributes: {
            username: chance.email(),
            firstName: chance.first(),
            lastName: chance.last(),
          },
        },
      };

      const response = await this.request
        .patch(`/users/${user.id}`)
        .send(updates);

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
          username: updates.data.attributes.username,
          firstName: updates.data.attributes.firstName,
          lastName: updates.data.attributes.lastName,
          updatedAt: validTimestamp,
          createdAt: validTimestamp,
        },
      });

      // it should also be in the database
      const record = await userModel.findById(user.id).exec();
      expect(record).to.exist;
      expect(record).to.include(updates.data.attributes);
    });
  });
});
