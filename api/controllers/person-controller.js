const personRepo = require('../repositories/person-repository');
const co = require('bluebird').coroutine;

const { serializer, deserializer } = personRepo;

module.exports = {
  getPeople: co(function* get(req, res) {
    const people = yield personRepo.findAll();
    res
      .type('application/vnd.api+json')
      .send(serializer.serialize(people));
  }),

  getPerson: co(function* get(req, res) {
    const params = req.swagger.params;
    const id = params.id.value;

    const person = yield personRepo.findById(id);

    if (person) {
      res
        .type('application/vnd.api+json')
        .send(serializer.serialize(person));
    } else {
      res.status(404).end('Person does not exist');
    }
  }),

  createPerson: co(function* post(req, res) {
    const params = req.swagger.params;
    const {
      username,
      firstName,
      lastName,
    } = yield deserializer.deserialize(params.person.value);

    const record = yield personRepo.create({ username, firstName, lastName });

    res
      .status(201)
      .type('application/vnd.api+json')
      .send(serializer.serialize(record));
  }),
};
