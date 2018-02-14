// test/support/express-stubs.js
exports.createRequest = () => ({
  swagger: {},
});

exports.createResponse = (sinon) => {
  const res = {};
  res.send = sinon.stub().returns(res);
  res.status = sinon.stub().returns(res);
  res.type = sinon.stub().returns(res);
  return res;
};
