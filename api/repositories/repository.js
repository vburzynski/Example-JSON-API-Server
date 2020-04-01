// api/repositories/repository.js
/* eslint class-methods-use-this: 0 */
const debug = require('debug')('api:repos:base');
const jsonapi = require('../support/swagger-jsonapi');

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

/**
 * Base Repository Class.
 */
class Repository {
  /**
   * Constructs a new Repository Instance
   * @param {string} type the name of the data type to connect to
   */
  constructor(type, db) {
    debug('constructor');
    this.type = type;
    this.name = capitalize(type);
    this.swagger = db.swagger;
    this.connection = db.connection;
    this.model = db.models[this.name];
    this.schema = db.schemas[this.name];
    this.typeMap = {};
    this.initSerializers();
  }

  /**
   * initializes the JSON API Serializer serializerOptions
   * @private
   */
  initSerializers() {
    const { type, swagger, schema } = this;
    const { serializer, deserializer } = jsonapi.generate(type, swagger, schema);

    this.serialize = serializer.serialize.bind(serializer);
    this.deserialize = deserializer.deserialize.bind(deserializer);
  }

  /**
   * generates a new record without inserting it into the database
   * @returns {Object}
   */
  new(json) {
    // eslint-disable-next-line
    return new this.model(json);
  }

  /**
   * creates one or more records and inserts them into the database
   * @returns {Promise}
   */
  create(obj) {
    return this.model.create(obj);
  }

  /**
   * queries for records
   * @returns {Promise}
   */
  find(...args) {
    return this.model.find(...args).exec();
  }

  /**
   * queries for all records
   * @returns {Promise}
   */
  findAll() {
    return this.model.find().exec();
  }

  /**
   * queries for a record by id
   * @returns {Promise}
   */
  findById(id) {
    return this.model.findById(id).exec();
  }

  /**
   * queries for the first matching record and updates it
   * @returns {Promise}
   */
  findOneAndUpdate(id, update) {
    return this.model.findOneAndUpdate(id, update, { new: true }).exec();
  }

  /**
   * queries for a record by id and updates it
   * @returns {Promise}
   */
  findByIdAndUpdate(id, update) {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  /**
   * queries for a record by id and removes it if found
   * @returns {Promise}
   */
  findByIdAndRemove(id) {
    return this.model.findByIdAndRemove(id).exec();
  }

  /**
   * drops the records from the mongodb collection
   * @returns {Promise}
   */
  drop() {
    return this.model.collection.deleteMany();
  }

  /**
   * inserts an array of records into the collection
   * @param  {array} records array of records
   * @return {Promise}
   */
  insertMany(records) {
    return this.model.insertMany(records);
  }
}

module.exports = Repository;
