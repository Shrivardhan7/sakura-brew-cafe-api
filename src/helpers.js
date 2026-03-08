const mongoose = require('mongoose');
const request = require('supertest');

// Lazy-load app so env vars are read first
const getApp = () => {
  // Clear module cache so server re-reads env
  jest.resetModules();
  return require('../../src/server');
};

/**
 * Connect to the in-memory MongoDB used by the test suite.
 */
const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
};

/**
 * Drop all collections between tests for isolation.
 */
const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Disconnect and drop the test database.
 */
const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

/**
 * Seed one admin + one customer user and return their tokens.
 */
const seedUsersAndLogin = async (app) => {
  // Register customer
  await request(app).post('/api/auth/register').send({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'Customer@1234',
  });

  // Register admin
  await request(app).post('/api/auth/register').send({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'Admin@1234',
  });

  // Promote to admin directly via model
  const User = require('../../src/models/User');
  await User.findOneAndUpdate({ email: 'admin@test.com' }, { role: 'admin' });

  // Login both
  const customerRes = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'Customer@1234',
  });

  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'Admin@1234',
  });

  return {
    customerToken: customerRes.body.token,
    adminToken: adminRes.body.token,
    customerId: customerRes.body.user?.id,
    adminId: adminRes.body.user?.id,
  };
};

/**
 * Create a sample menu item and return its ID.
 */
const seedMenuItem = async (adminToken, app, overrides = {}) => {
  const payload = {
    name: { en: 'Test Matcha', jp: 'テスト抹茶' },
    description: { en: 'A test matcha drink', jp: 'テスト用抹茶ドリンク' },
    category: 'matcha',
    itemType: 'drink',
    isVegetarian: true,
    sizes: [
      { size: 'small', price: 4.0 },
      { size: 'medium', price: 5.0 },
      { size: 'large', price: 5.5 },
    ],
    tags: ['test', 'matcha'],
    ...overrides,
  };

  const res = await request(app)
    .post('/api/menu')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(payload);

  return res.body.menuItem?._id || res.body._id;
};

module.exports = {
  getApp,
  connectTestDB,
  clearDB,
  closeTestDB,
  seedUsersAndLogin,
  seedMenuItem,
};
