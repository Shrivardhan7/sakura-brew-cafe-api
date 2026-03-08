const request = require('supertest');
const mongoose = require('mongoose');
const { connectTestDB, closeTestDB } = require('./setup/helpers');

let app;

beforeAll(async () => {
  await connectTestDB();
  app = require('../src/server');
});

afterAll(async () => {
  await closeTestDB();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET / — Root Welcome', () => {
  it('returns 200 with welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Sakura Brew');
    expect(res.body.messageJp).toBeTruthy();
    expect(res.body.endpoints).toHaveProperty('auth');
    expect(res.body.endpoints).toHaveProperty('menu');
    expect(res.body.endpoints).toHaveProperty('orders');
    expect(res.body.endpoints).toHaveProperty('docs');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/health — Health Check', () => {
  it('returns 200 with status healthy', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body.environment).toBe('test');
  });

  it('timestamp is a valid ISO 8601 date string', async () => {
    const res = await request(app).get('/api/health');
    const ts = new Date(res.body.timestamp);
    expect(ts.toString()).not.toBe('Invalid Date');
  });

  it('uptime is a positive number', async () => {
    const res = await request(app).get('/api/health');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /unknown-route — 404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
