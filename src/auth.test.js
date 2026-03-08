const request = require('supertest');
const mongoose = require('mongoose');
const { connectTestDB, clearDB, closeTestDB } = require('./setup/helpers');

let app;

beforeAll(async () => {
  await connectTestDB();
  app = require('../src/server');
});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeTestDB();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  const validUser = {
    name: 'Yuki Tanaka',
    email: 'yuki@test.com',
    password: 'Yuki@1234',
  };

  it('registers a new user and returns a JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('sets default preferences (en / light)', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.body.user.preferences.language).toBe('en');
    expect(res.body.user.preferences.theme).toBe('light');
  });

  it('accepts custom preferences (jp / dark)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, preferences: { language: 'jp', theme: 'dark' } });

    expect(res.body.user.preferences.language).toBe('jp');
    expect(res.body.user.preferences.theme).toBe('dark');
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });

    expect(res.statusCode).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'login@test.com',
      password: 'Login@1234',
    });
  });

  it('returns a JWT token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Login@1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'WrongPassword@1' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'Login@1234' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects login with missing body', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Me Test',
      email: 'me@test.com',
      password: 'Me@12345',
    });
    token = reg.body.token;
  });

  it('returns the authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.statusCode).toBe(401);
  });
});
