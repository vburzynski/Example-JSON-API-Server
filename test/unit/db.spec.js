const { expect } = require('chai');
const proxyquire = require('proxyquire');
const swaggerMongoose = require('swagger-mongoose');

describe('Unit — Database', () => {
  let db;
  let sinon;
  let stubs;

  before(function () {
    stubs = {};
    stubs.mongoose = {};
    db = proxyquire('../../api/db', {
      mongoose: stubs.mongoose,
    });
  });

  beforeEach(function () {
    sinon = this.sandbox;
    stubs.mongoose.connect = sinon.stub();
  });

  context('#connect', () => {
    it('connects to the mongo database', async () => {
      stubs.mongoose.connection = {
        readyState: 0,
        on: sinon.stub(),
        once: sinon.stub(),
      };

      stubs.parseSwagger = sinon.stub(db, 'parseSwagger');

      await db.connect();

      expect(stubs.mongoose.connect).to.have.been.calledOnce;
      expect(stubs.mongoose.connection.on).to.have.been.calledOnce;
      expect(stubs.mongoose.connection.once).to.have.been.calledOnce;
      expect(stubs.parseSwagger).to.have.been.calledOnce;
    });
  });

  context('#disconnect', () => {
    context('connection exists', () => {
      it('closes the connection', () => {
        db.isConnected = true;

        stubs.mongoose.connection = {
          close: sinon.stub(),
        };

        db.disconnect();

        expect(db.isConnected).to.be.false;
        expect(stubs.mongoose.connection.close).to.have.been.calledOnce;
      });
    });
    context('connection does not exist', () => {
      it('does nothing', () => {
        db.isConnected = false;

        stubs.mongoose.connection = {
          close: sinon.stub(),
        };

        db.disconnect();

        expect(db.isConnected).to.be.false;
        expect(stubs.mongoose.connection.close).to.have.not.been.called;
      });
    });
  });

  context('#parseSwagger', () => {
    it('loads the swagger schema and compiles the swagger mongoose specs', () => {
      stubs.compile = sinon.stub(swaggerMongoose, 'compile');
      stubs.compile.returns({
        models: 'fake-models',
        schemas: 'fake-schemas',
      });

      db.parseSwagger();

      expect(db.models).to.equal('fake-models');
      expect(db.schemas).to.equal('fake-schemas');
    });
  });
});
