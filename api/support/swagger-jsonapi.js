// api/support/swagger-jsonapi.js
const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');
const debug = require('debug')('api:swagger-jsonapi');

/**
 * Retrieves a path reference to a definition from a Swagger Schema Object
 * @param  {object} property [description]
 * @return {[type]}          [description]
 */
exports.getReference = (property) => {
  let ref;
  if (property.type === 'array') {
    ref = _.get(property, 'items.$ref');
  } else {
    ref = _.get(property, 'properties.data.$ref');
  }
  return ref.split('/').pop();
};

exports.pullAttributes = value => _.chain(value)
  .get('paths')
  .keys()
  .pull('__v', '_id')
  .value();

/**
 * parses swagger for relationship related serializer options
 */
exports.parseSwagger = (swagger, type, typeMap, serializerOptions, deserializerOptions) => {
  debug('parseSwagger');

  // get the relationship properties from the swagger definition for this type
  const path = `definitions[${type}].properties.relationships.properties`;
  const relationships = _.get(swagger, path);

  _.forEach(relationships, (property, name) => {
    debug('property:', name);

    // denote the attributes which are relationships for the serializer
    _.set(serializerOptions, name, {
      ref: (record, value) => (value ? value.toString() : value),
      included: false,
    });

    // denote what value to use to represent the relationship.
    // JSON API sends an identifier and type
    const definitionReference = exports.getReference(property);
    _.set(typeMap, name, definitionReference);
    _.set(deserializerOptions, definitionReference, {
      valueForRelationship: relationship => relationship.id,
    });
  });
};

exports.generate = (type, swagger, schema) => {
  debug('generate');
  // Pull the attributes from the schema
  const attributes = exports.pullAttributes(schema);
  debug('attributes', attributes);

  const typeMap = {};

  const serializerOptions = {
    // Mongoose uses _id
    id: '_id',
    // provide the serializer with the attributes that should be included
    attributes,
    // specify the case to be used for the keys
    keyForAttribute: 'camelCase',
    // maps attributes to a type
    // when type is specified, use it, otherwise get it from the type map.
    typeForAttribute: (name, value) => value.type || _.get(typeMap, name),
    // pluralize the types
    pluralizeType: true,
  };

  const deserializerOptions = {
    keyForAttribute: 'camelCase',
  };

  exports.parseSwagger(serializerOptions, deserializerOptions);

  return {
    serializer: new Serializer(type, serializerOptions),
    deserializer: new Deserializer(deserializerOptions),
  };
};
