// test/unit/repositories/user-repository.spec.js
const _ = require('lodash');
const { expect } = require('chai');
const proxyquire = require('proxyquire');

describe('User Repository', () => {
  let userRepo;
  let sinon;
  let mocks;
  let UserRepository;
  let Repository;
  let mockHelper;

  before(() => {
    mockHelper = {};

    Repository = proxyquire('../../../api/repositories/repository', {
      '../support/swagger-jsonapi': mockHelper,
    });

    UserRepository = proxyquire('../../../api/repositories/user-repository', {
      './repository': Repository,
    });
  });

  beforeEach(function () {
    sinon = this.sandbox;
    mocks = {};

    // create a mock database module to instantiate the user repo
    mocks.db = {
      models: { User: 'fake-model' },
      schemas: { User: 'fake-schema' },
    };

    // stub init serializers
    mocks.initSerializers = sinon.stub(
      UserRepository.prototype,
      'initSerializers',
    );

    // create a user repository
    userRepo = new UserRepository(mocks.db);
  });

  context('#constructor', () => {
    it('creates an instance of UserRepository', () => {
      expect(userRepo).to.be.an.instanceOf(UserRepository);
      expect(userRepo).to.be.an.instanceOf(Repository);
      expect(mocks.initSerializers).to.have.been.called;
      expect(userRepo.model).to.equal('fake-model');
      expect(userRepo.schema).to.equal('fake-schema');
    });

    it('has a type of "user"', () => {
      expect(userRepo.type).to.equal('user');
    });
  });

  context('#initSerializers', () => {
    beforeEach(async function () {
      mocks.initSerializers.restore();

      // create a mock return value for the db generate function.
      mocks.serializers = {
        serializer: { serialize: sinon.stub() },
        deserializer: { deserialize: sinon.stub() },
      };

      userRepo.type = 'fake-type';
      userRepo.swagger = 'fake-swagger';
      userRepo.schema = 'fake-schema';
    });
    it('sets the serializer and deserializer', () => {
      mockHelper.generate = sinon.stub()
        .withArgs('fake-type', 'fake-swagger', 'fake-schema')
        .returns(mocks.serializers);

      userRepo.initSerializers();
      expect(mockHelper.generate).to.have.been.called;

      userRepo.serialize();
      userRepo.deserialize();
      expect(mocks.serializers.serializer.serialize).to.have.been.calledOnce;
      expect(mocks.serializers.deserializer.deserialize).to.have.been.calledOnce;
    });
  });

  context('#new', () => {
    it('uses the mongoose Model to build a new instance', () => {
      mocks.model = sinon.stub();
      userRepo.model = mocks.model;

      const result = userRepo.new('fake-json');

      expect(result).to.be.an.instanceOf(mocks.model);
      expect(mocks.model.firstCall.args[0]).to.equal('fake-json');
    });
  });

  context('#create', () => {
    it('uses the mongoose Model to create a new instance', () => {
      _.set(mocks, 'model.create', sinon.stub());
      mocks.model.create.withArgs('fake-json').returns('fake-record');
      userRepo.model = mocks.model;
      const result = userRepo.create('fake-json');
      expect(result).to.equal('fake-record');
    });
  });

  context('#find', () => {
    it('queries for records', () => {
      // mock a mongoose query that resolves with a fake result
      mocks.query = { exec: sinon.stub().resolves('fake-result') };

      // find returns a query
      _.set(mocks, 'model.find', sinon.stub());
      mocks.model.find.withArgs('arg1').returns(mocks.query);
      userRepo.model = mocks.model;

      const result = userRepo.find('arg1');

      return expect(result).to.eventually.equal('fake-result');
    });
  });

  context('#findAll', () => {
    it('queries for all records', () => {
      // mock a mongoose query that resolves with a fake result
      mocks.query = { exec: sinon.stub().resolves('fake-result') };

      // find returns a query
      mocks.model = {};
      mocks.model.find = sinon.stub()
        .returns(mocks.query);
      userRepo.model = mocks.model;

      const result = userRepo.findAll();

      return expect(result).to.eventually.equal('fake-result');
    });
  });

  context('#findById', () => {
    it('queries for a record by id', () => {
      // mock a mongoose query that resolves with a fake result
      mocks.query = { exec: sinon.stub().resolves('fake-result') };

      // find returns a query
      mocks.model = {};
      mocks.model.findById = sinon.stub()
        .withArgs('fake-id')
        .returns(mocks.query);
      userRepo.model = mocks.model;

      const result = userRepo.findById('fake-id');

      return expect(result).to.eventually.equal('fake-result');
    });
  });

  context('#findOneAndUpdate', () => {
    it('queries for one record and updates it', () => {
      // mock a mongoose query that resolves with a fake result
      mocks.query = { exec: sinon.stub().resolves('fake-result') };

      // find returns a query
      mocks.model = {};
      mocks.model.findOneAndUpdate = sinon.stub()
        .withArgs('fake-condition', 'fake-update')
        .returns(mocks.query);
      userRepo.model = mocks.model;

      const result = userRepo.findOneAndUpdate('fake-condition', 'fake-update');
      return expect(result).to.eventually.equal('fake-result');
    });
  });

  context('#findByIdAndUpdate', () => {
    it('queries for a record by id and updates it', () => {
      // mock a mongoose query that resolves with a fake result
      mocks.query = { exec: sinon.stub().resolves('fake-result') };

      // find returns a query
      mocks.model = {};
      mocks.model.findByIdAndUpdate = sinon.stub()
        .withArgs('fake-id', 'fake-update')
        .returns(mocks.query);
      userRepo.model = mocks.model;

      const result = userRepo.findByIdAndUpdate('fake-id', 'fake-update');
      return expect(result).to.eventually.equal('fake-result');
    });
  });

  context('#findByIdAndRemove', () => {
    it('queries for a record by id and removes it', () => {
      // mock a mongoose query that resolves with a fake result
      mocks.query = { exec: sinon.stub().resolves('fake-result') };

      // find returns a query
      mocks.model = {};
      mocks.model.findByIdAndRemove = sinon.stub()
        .withArgs('fake-id')
        .returns(mocks.query);
      userRepo.model = mocks.model;

      const result = userRepo.findByIdAndRemove('fake-id');
      return expect(result).to.eventually.equal('fake-result');
    });
  });

  context('#drop', () => {
    it('drops all records from the collection', () => {
      _.set(mocks, 'model.collection.remove', sinon.stub().resolves(true));
      userRepo.model = mocks.model;
      const result = userRepo.drop();
      return expect(result).to.eventually.be.true;
    });
  });

  context('#insertMany', () => {
    it('inserts many records', () => {
      _.set(mocks, 'model.insertMany', sinon.stub().withArgs('fake-records').resolves(true));
      userRepo.model = mocks.model;
      const result = userRepo.insertMany('fake-records');
      return expect(result).to.eventually.be.true;
    });
  });
});
