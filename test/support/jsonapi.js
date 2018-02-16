// test/support/jsonapi.js
const _ = require('lodash');
const { generate } = require('../../api/support/swagger-jsonapi');
const debug = require('debug')('test:jsonapi');

exports.serializers = {};
exports.deserializers = {};

exports.init = (swagger, schemas) => {
  debug('json api init');
  const types = Object.keys(schemas);

  types.forEach((type) => {
    debug('type:', type);
    const schema = _.get(schemas, type);
    const { serializer, deserializer } = generate(type, swagger, schema);

    exports.serializers[type] = records => serializer.serialize(records);
    exports.deserializers[type] = records => deserializer.deserialize(records);
  });
};
