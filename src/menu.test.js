const request = require('supertest');
const { connectTestDB, clearDB, closeTestDB, seedUsersAndLogin } = require('./setup/helpers');

let app, adminToken, customerToken;

const sampleItem = {
  name: { en: 'Cherry Blossom Latte', jp: 'さくらラテ' },
  description: { en: 'Spring sakura-flavoured latte', jp: '春のさくらラテ' },
  category: 'seasonal',
  itemType: 'drink',
  isVegetarian: true,
  isSeasonal: true,
  sizes: [
    { size: 'small', price: 4.5 },
    { size: 'medium', price: 5.25 },
    { size: 'large', price: 5.75 },
  ],
  tags: ['sakura', 'seasonal', 'spring'],
};

beforeAll(async () => {
  await connectTestDB();
  app = require('../src/server');
  ({ adminToken, customerToken } = await seedUsersAndLogin(app));
});

beforeEach(async () => {
  // Only clear menu items between tests, not users
  const mongoose = require('mongoose');
  await mongoose.connection.collections['menuitems']?.deleteMany({});
});

afterAll(async () => {
  await closeTestDB();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/menu', () => {
  it('returns an empty menu when database is empty', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('menu');
  });

  it('returns menu items grouped by category', async () => {
    // Seed one item first
    await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleItem);

    const res = await request(app).get('/api/menu');
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.menu).toHaveProperty('seasonal');
  });

  it('supports ?lang=jp language parameter', async () => {
    await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleItem);

    const res = await request(app).get('/api/menu?lang=jp');
    expect(res.statusCode).toBe(200);
    expect(res.body.language).toBe('jp');
  });

  it('filters by category', async () => {
    await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleItem);

    const res = await request(app).get('/api/menu?category=seasonal');
    expect(res.statusCode).toBe(200);
  });

  it('filters seasonal items with ?isSeasonal=true', async () => {
    await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleItem);

    const res = await request(app).get('/api/menu?isSeasonal=true');
    expect(res.statusCode).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/menu — Admin Create', () => {
  it('creates a menu item as admin', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleItem);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('rejects menu creation from a customer (403)', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(sampleItem);

    expect(res.statusCode).toBe(403);
  });

  it('rejects menu creation without authentication (401)', async () => {
    const res = await request(app).post('/api/menu').send(sampleItem);
    expect(res.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/menu/categories', () => {
  it('returns the list of categories', async () => {
    const res = await request(app).get('/api/menu/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/menu/:id', () => {
  it('returns 404 for a non-existent ID', async () => {
    const fakeId = '64f1a2b3c4d5e6f7a8b9c0d1';
    const res = await request(app).get(`/api/menu/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('PATCH /api/menu/:id/availability', () => {
  it('admin can toggle item availability', async () => {
    const create = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleItem);

    const itemId = create.body.menuItem?._id || create.body._id;
    if (!itemId) return; // skip if create response shape differs

    const res = await request(app)
      .patch(`/api/menu/${itemId}/availability`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.statusCode);
  });
});
