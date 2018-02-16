// test/unit/support/swagger-jsonapi.spec.js
const _ = require('lodash');
const { expect } = require('chai');
const helper = require('../../../api/support/swagger-jsonapi');

describe('Swagger JSON API Helper', () => {
  context('#getReference', () => {
    context('given a schema object of type array with a reference', () => {
      it('returns the base name of the referenced item', () => {
        const result = helper.getReference({
          type: 'array',
          items: {
            $ref: '#/definitions/TestObject',
          },
        });
        expect(result).to.equal('TestObject');
      });
    });
    context('given a schema object of type object with a reference', () => {
      it('returns the base name of the referenced item', () => {
        const result = helper.getReference({
          type: 'object',
          properties: {
            data: {
              $ref: '#/definitions/TestObject',
            },
          },
        });
        expect(result).to.equal('TestObject');
      });
    });
  });

  context('#parseSwagger', () => {
    const swagger = {
      definitions: {
        TestObject: {
          type: 'object',
          properties: {
            relationships: {
              type: 'object',
              properties: {
                relationship1: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/definitions/TestRel1',
                    },
                  },
                },
                relationship2: {
                  type: 'array',
                  items: {
                    $ref: '#/definitions/TestRel2',
                  },
                },
              },
            },
          },
        },
      },
    };
    const serializerOptions = {};
    const deserializerOptions = {};
    const typeMap = {};

    before(() => {
      helper.parseSwagger(swagger, 'TestObject', typeMap, serializerOptions, deserializerOptions);
    });

    it('maps the relationship name to the matching definition name', () => {
      expect(typeMap).to.deep.equal({
        relationship1: 'TestRel1',
        relationship2: 'TestRel2',
      });
    });

    it('generates serializer options for each relationship', () => {
      expect(serializerOptions).to.matchPattern({
        relationship1: {
          ref: _.isFunction,
          included: false,
        },
        relationship2: {
          ref: _.isFunction,
          included: false,
        },
      });

      const fn = serializerOptions.relationship1.ref;
      expect(fn(null, 'fake-value')).to.equal('fake-value');
      expect(fn(null, 1)).to.equal('1');
      expect(fn(null, null)).to.equal(null);
      expect(fn()).to.be.undefined;
    });

    it('generates deserializer options for each relationship', () => {
      expect(deserializerOptions).to.matchPattern({
        TestRel1: {
          valueForRelationship: _.isFunction,
        },
        TestRel2: {
          valueForRelationship: _.isFunction,
        },
      });

      const fn = deserializerOptions.TestRel1.valueForRelationship;
      expect(fn({ id: 'fake-id' })).to.equal('fake-id');
    });
  });
});
