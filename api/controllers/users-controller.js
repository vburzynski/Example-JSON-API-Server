const _ = require('lodash');
const { repos } = require('../repositories');
const debug = require('debug')('api:controllers:user');

module.exports = {
  /**
   * POST endpoint for creating a new user
   * @param  {object}  req express request object
   * @param  {object}  res epresss response object
   */
  createUser: async (req, res) => {
    debug('execute - createUser');

    debug('parsing swagger parameters');
    const { params } = req.swagger;
    const rawUser = _.get(params, 'user.value');
    debug('raw user', rawUser);

    debug('deserializing user');
    const { username, firstName, lastName } = await repos.user.deserialize(rawUser);
    debug('username:', username);
    debug('first name:', firstName);
    debug('last name:', lastName);

    debug('creating record');
    const record = await repos.user.create({ username, firstName, lastName });
    debug('record', record);

    debug('serializing');
    const body = repos.user.serialize(record);

    debug('sending response:', body);
    return res.type('application/vnd.api+json')
      .status(201)
      .send(body);
  },

  /**
   * GET endpoint to retrieve all user records
   * @param  {object}  req express request object
   * @param  {object}  res express response object
   */
  getUsers: async (req, res) => {
    debug('query for all users');
    const users = await repos.user.findAll();

    debug('send users serialized in JSON API format');
    res.type('application/vnd.api+json')
      .status(200)
      .send(repos.user.serialize(users));
  },

  /**
   * GET endpoint for retrieving a user by id
   * @param  {object}  req express request object
   * @param  {object}  res express response object
   */
  getUser: async (req, res) => {
    debug('parsing swagger parameters');
    const { params } = req.swagger;
    const id = params.id.value;

    debug('query for user by id');
    const record = await repos.user.findById(id);

    if (record) {
      debug('record found, sending back');
      res.type('application/vnd.api+json')
        .status(200)
        .send(repos.user.serialize(record));
    } else {
      debug('record not found, sending error response');
      res.type('application/vnd.api+json')
        .status(404)
        .send({
          errors: [{
            status: '404',
            title: 'User Not Found',
            detail: `A user with id ${id} could not be found`,
          }],
        });
    }
  },

  /**
   * Updates the user record specified by an id query parameter
   * @param  {Object}  req express request object
   * @param  {Object}  res express response object
   */
  updateUserById: async (req, res) => {
    debug('parsing swagger parameters');
    const { params } = req.swagger;
    const id = params.id.value;
    const user = params.user.value;

    debug('deserializing');
    const update = await repos.user.deserialize(user);

    debug('query for user by id and update');
    const record = await repos.user.findByIdAndUpdate(id, update);

    if (record) {
      debug('record updated');
      res.type('application/vnd.api+json')
        .status(200)
        .send(repos.user.serialize(record));
    } else {
      debug('record not updated');
      res.type('application/vnd.api+json')
        .status(404)
        .send({
          errors: [{
            status: '404',
            title: 'User Not Found',
            detail: `A user with id ${id} could not be found`,
          }],
        });
    }
  },

  /**
   * Removes the user record specified by an id query parameter
   * @param  {Object}  req express request object
   * @param  {Object}  res express request object
   */
  removeUserById: async (req, res) => {
    debug('parsing swagger parameters');
    const { params } = req.swagger;
    const id = params.id.value;

    debug('query for user by id and remove');
    const record = await repos.user.findByIdAndRemove(id);

    if (record) {
      debug('record removed');
      res.type('application/vnd.api+json')
        .status(200)
        .send(repos.user.serialize(record));
    } else {
      debug('record not removed');
      res.type('application/vnd.api+json')
        .status(404)
        .send({
          errors: [{
            status: '404',
            title: 'User Not Found',
            detail: `A user with id ${id} could not be found`,
          }],
        });
    }
  },
};
