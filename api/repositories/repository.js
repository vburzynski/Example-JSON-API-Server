const _ = require('lodash');
const databaseConnection = require('../databaseConnection');
const { Serializer, Deserializer } = require('jsonapi-serializer');

function getReferenceType(property) {
  const arrayRef = _.get(property, 'items.$ref', '');
  const ref = _.get(property, 'properties.data.$ref', arrayRef);
  return ref.split('/').pop();
}

class Repository {
  constructor(type) {
    this.connection = databaseConnection.connect();
    this.Model = databaseConnection.models[type];
    this.schema = databaseConnection.schemas[type];

    // TODO: Move to helper _filterMongooseAttributes() ?
    const attributes = _
      .chain(this.schema)
      .get('paths')
      .keys()
      .pull('__v', '_id')
      .value();

    const typeMap = {};

    const serializerOptions = {
      id: '_id',
      attributes,
      keyForAttribute: 'camelCase',
      typeForAttribute: (attribute, value) => value.type || typeMap[attribute],
      pluralizeType: true,
    };

    const deserializerOptions = {
      keyForAttribute: 'camelCase',
    };

    const relationshipProps = _.get(databaseConnection, `swagger.definitions[${type}].properties.relationships.properties`);

    _.forEach(relationshipProps, (property, name) => {
      const propType = getReferenceType(property);

      serializerOptions[name] = {
        ref: (record, value) => (value ? value.toString() : value),
        included: false,
      };

      if (propType) {
        typeMap[name] = propType;

        deserializerOptions[propType] = {
          valueForRelationship: relationship => relationship.id,
        };
      }
    }, this);

    this.serializer = new Serializer(type, serializerOptions);
    this.deserializer = new Deserializer(deserializerOptions);
  }

  new(json) {
    return new this.Model(json);
  }

  create(...args) {
    return this.Model.create(...args);
  }

  find(...args) {
    return this.Model.find(...args);
  }

  findAll() {
    return this.Model.find();
  }

  findById(id) {
    return this.Model.findById(id);
  }

  findOneAndUpdate(...args) {
    return this.Model.findOneAndUpdate(...args);
  }

  findByIdAndUpdate(...args) {
    return this.Model.findByIdAndUpdate(...args);
  }

  findByIdAndRemove(...args) {
    return this.Model.findByIdAndRemove(...args);
  }

  drop() {
    return this.Model.collection.remove();
  }

  insertMany(records) {
    return this.Model.insertMany(records);
  }
}

module.exports = Repository;
