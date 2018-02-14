// test/integration/database.spec.js
const { expect } = require('chai');
const db = require('../../api/db');

const DISCONNECTED = 0;
const CONNECTED = 1;

describe('Database', () => {
  beforeEach(async () => {
    await db.connect();
  });
  it('connects to the mongo database', async () => {
    expect(db.connection.readyState).to.equal(CONNECTED);
    await db.disconnect();
  });
  it('closes the connection to the mongo database', async () => {
    db.disconnect();
    expect(db.connection.readyState).to.equal(DISCONNECTED);
    await db.connect();
  });
});
