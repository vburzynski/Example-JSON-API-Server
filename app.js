// app.js
const Server = require('./api/server');

const config = {
  appRoot: __dirname,
};

const api = new Server(config);

api.init();
