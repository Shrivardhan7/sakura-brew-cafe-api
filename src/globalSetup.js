const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test-jwt-secret-sakura-brew-2026';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.NODE_ENV = 'test';
  // Store mongod instance ref so globalTeardown can stop it
  global.__MONGOD__ = mongod;
};
