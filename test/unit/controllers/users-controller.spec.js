// test/unit/controllers/users-controller.spec.js
const _ = require('lodash');
const { expect } = require('chai');
const { factory } = require('factory-girl');
const expressStubs = require('../../support/express-stubs');
const userController = require('../../../api/controllers/users-controller');
const UserRepository = require('../../../api/repositories/user-repository');
const repositories = require('../../../api/repositories');

describe('User Controller', () => {
  let sinon;
  let stubReq;
  let stubRes;
  let stubUserRepo;

  // use function syntax here so that we have access to `this`
  beforeEach(function () {
    // reference the sandbox created in setup.js
    sinon = this.sandbox;

    // stub request and response
    stubReq = expressStubs.createRequest(sinon);
    stubRes = expressStubs.createResponse(sinon);

    // stub user repository
    stubUserRepo = sinon.createStubInstance(UserRepository);

    // add reference in repositories module
    repositories.repos.user = stubUserRepo;
  });
  afterEach(() => {
    // cleanup reference
    delete repositories.repos.user;
  });
  context('#createUser', () => {
    // new user fixture, method destructures from this
    let newUser;
    beforeEach(() => {
      newUser = factory.build('user');
    });
    it('creates and inserts a new user', async () => {
      // stub deserializing the JSON API formatted request body
      stubUserRepo.deserialize = sinon.stub()
        .withArgs('new-user-post-request')
        .resolves(newUser);

      // stub the method to create the user
      stubUserRepo.create
        .withArgs(newUser)
        .resolves('new-user-record');

      // stub serializing the record back into JSON API format
      stubUserRepo.serialize = sinon.stub()
        .withArgs('new-user-record')
        .returns('serialized-user');

      // set a fake value for our user body parameter
      _.set(stubReq, 'swagger.params.user.value', 'new-user-post-request');

      // execute the operation
      await userController.createUser(stubReq, stubRes);

      // verify response was sent properly
      expect(stubRes.send).to.have.been.calledWith('serialized-user');
      expect(stubRes.status).to.have.been.calledWith(201);
      expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
    });
  });
  context('#getUsers', () => {
    it('queries for and sends back all users', async () => {
      const fakeUsers = ['test-user-1', 'test-user-2', 'test-user-3'];

      // stub #findAll to return three fake user records
      stubUserRepo.findAll
        .withArgs()
        .resolves(fakeUsers);

      // stub serialize
      stubUserRepo.serialize = sinon.stub()
        .withArgs(fakeUsers)
        .returns('serialized-users');

      // execute the method
      await userController.getUsers(stubReq, stubRes);

      // verify response was sent properly
      expect(stubRes.send).to.have.been.calledWith('serialized-users');
      expect(stubRes.status).to.have.been.calledWith(200);
      expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
    });
  });
  context('#getUser', () => {
    beforeEach(() => {
      // set id parameter on the stub request
      _.set(stubReq, 'swagger.params.id.value', 1);
    });
    // test the happy path
    context('when the user exists', () => {
      it('retrieves the user', async () => {
        // stub method to find by id
        stubUserRepo.findById
          .withArgs(1)
          .returns('test-user');

        // stub the serializer
        stubUserRepo.serialize = sinon.stub()
          .withArgs('test-user')
          .returns('serialized-test-user');

        // execute
        await userController.getUser(stubReq, stubRes);

        expect(stubRes.send).to.have.been.calledWith('serialized-test-user');
        expect(stubRes.status).to.have.been.calledWith(200);
        expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
      });
    });
    // test the error path
    context('when the user does not exist', () => {
      it('sends 404 User Not Found Error Response', async () => {
        // stub method to find by id
        stubUserRepo.findById
          .withArgs(1)
          .returns(undefined);

        // execute
        await userController.getUser(stubReq, stubRes);

        // expect 404 error with an appropriate JSON API Error Response
        expect(stubRes.status).to.have.been.calledWith(404);
        expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
        expect(stubRes.send).to.have.been.calledWithExactly({
          errors: [{
            status: '404',
            title: 'User Not Found',
            detail: 'A user with id 1 could not be found',
          }],
        });
      });
    });
  });
  context('#updateUserById', () => {
    beforeEach(() => {
      // set id parameter on the stub createRequest
      _.set(stubReq, 'swagger.params.id.value', 1);

      // set the body parameter
      _.set(stubReq, 'swagger.params.user.value', 'updated-user-data');
    });
    // test the happy path
    context('when the user exists', () => {
      it('updates the user and sends it back', async () => {
        // stub the deserializer
        stubUserRepo.deserialize = sinon.stub()
          .withArgs('updated-user-data')
          .resolves('deserialized-user');

        // stub the find by id and update
        stubUserRepo.findByIdAndUpdate
          .withArgs(1, 'deserialized-user')
          .resolves('updated-record');

        // stub the serializer
        stubUserRepo.serialize = sinon.stub()
          .withArgs('updated-record')
          .returns('serialized-test-user');

        // execute the method
        await userController.updateUserById(stubReq, stubRes);

        // expect success
        expect(stubRes.send).to.have.been.calledWith('serialized-test-user');
        expect(stubRes.status).to.have.been.calledWith(200);
        expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
      });
    });
    context('when the user does not exist', () => {
      it('sends a 404 User Not Found error response', async () => {
        // stub the deserializer
        stubUserRepo.deserialize = sinon.stub()
          .withArgs('updated-user-data')
          .resolves('deserialized-user');

        // stub method to find by id and update
        stubUserRepo.findByIdAndUpdate
          .withArgs(1, 'deserialized-user')
          .returns(undefined);

        // execute
        await userController.updateUserById(stubReq, stubRes);

        // expect 404 error with an appropriate JSON API Error Response
        expect(stubRes.status).to.have.been.calledWith(404);
        expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
        expect(stubRes.send).to.have.been.calledWithExactly({
          errors: [{
            status: '404',
            title: 'User Not Found',
            detail: 'A user with id 1 could not be found',
          }],
        });
      });
    });
  });
  context('#removeUserById', () => {
    beforeEach(() => {
      // set id parameter on the stub createRequest
      _.set(stubReq, 'swagger.params.id.value', 1);
    });
    context('When the user exists', () => {
      it('removes the user', async () => {
        // stub the find by id and update
        stubUserRepo.findByIdAndRemove
          .withArgs(1)
          .resolves('removed-record');

        // stub the serializer
        stubUserRepo.serialize = sinon.stub()
          .withArgs('removed-record')
          .returns('serialized-user');

        // execute
        await userController.removeUserById(stubReq, stubRes);

        // expect success
        expect(stubRes.send).to.have.been.calledWith('serialized-user');
        expect(stubRes.status).to.have.been.calledWith(200);
        expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
      });
    });
    context('When the user does not exist', () => {
      it('sends back an error message', async () => {
        // stub the find by id and update
        stubUserRepo.findByIdAndRemove
          .withArgs(1)
          .resolves(undefined);

        // execute
        await userController.removeUserById(stubReq, stubRes);

        // expect 404 error with an appropriate JSON API Error Response
        expect(stubRes.status).to.have.been.calledWith(404);
        expect(stubRes.type).to.have.been.calledWith('application/vnd.api+json');
        expect(stubRes.send).to.have.been.calledWithExactly({
          errors: [{
            status: '404',
            title: 'User Not Found',
            detail: 'A user with id 1 could not be found',
          }],
        });
      });
    });
  });
});
