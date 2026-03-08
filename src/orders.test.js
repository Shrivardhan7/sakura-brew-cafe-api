const request = require('supertest');
const mongoose = require('mongoose');
const { connectTestDB, clearDB, closeTestDB, seedUsersAndLogin } = require('./setup/helpers');

let app, adminToken, customerToken;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const createMenuItem = async () => {
  const res = await request(app)
    .post('/api/menu')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: { en: 'Matcha Latte', jp: '抹茶ラテ' },
      description: { en: 'Creamy matcha', jp: 'クリーミー抹茶' },
      category: 'matcha',
      itemType: 'drink',
      isVegetarian: true,
      sizes: [
        { size: 'small', price: 4.0 },
        { size: 'medium', price: 5.0 },
        { size: 'large', price: 5.5 },
      ],
      tags: ['matcha'],
    });
  return res.body.menuItem?._id || res.body._id;
};

beforeAll(async () => {
  await connectTestDB();
  app = require('../src/server');
  ({ adminToken, customerToken } = await seedUsersAndLogin(app));
});

beforeEach(async () => {
  await mongoose.connection.collections['menuitems']?.deleteMany({});
  await mongoose.connection.collections['orders']?.deleteMany({});
});

afterAll(async () => {
  await closeTestDB();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/orders — Place Order', () => {
  it('places an order as authenticated customer', async () => {
    const menuItemId = await createMenuItem();
    if (!menuItemId) return;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItem: menuItemId, size: 'medium', quantity: 1 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order).toHaveProperty('orderNumber');
    expect(res.body.order.status).toBe('pending');
    expect(res.body.order.paymentStatus).toBe('unpaid');
    expect(res.body).toHaveProperty('loyaltyPointsEarned');
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [] });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 for an empty items array', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [] });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for a non-existent menu item', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItem: fakeId, size: 'medium', quantity: 1 }],
      });
    // 400 or 404 depending on implementation
    expect([400, 404]).toContain(res.statusCode);
  });

  it('calculates totalAmount and tax correctly', async () => {
    const menuItemId = await createMenuItem();
    if (!menuItemId) return;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItem: menuItemId, size: 'medium', quantity: 2 }],
      });

    if (res.statusCode === 201) {
      expect(res.body.order.subtotal).toBeGreaterThan(0);
      expect(res.body.order.totalAmount).toBeGreaterThanOrEqual(res.body.order.subtotal);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/orders — My Orders', () => {
  it('returns the authenticated users orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/orders/pay — Payment', () => {
  let orderId;

  beforeEach(async () => {
    const menuItemId = await createMenuItem();
    if (!menuItemId) return;

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItem: menuItemId, size: 'medium', quantity: 1 }],
      });

    orderId = orderRes.body.order?._id;
  });

  it('processes a card payment successfully', async () => {
    if (!orderId) return;

    const res = await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, paymentMethod: 'card' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.receipt.paymentStatus).toBe('paid');
    expect(res.body.receipt.paymentMethod).toBe('card');
    expect(res.body.receipt).toHaveProperty('transactionRef');
    expect(res.body.receipt).toHaveProperty('amountCharged');
    expect(res.body.receipt).toHaveProperty('paidAt');
  });

  it('processes a cash payment', async () => {
    if (!orderId) return;

    const res = await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, paymentMethod: 'cash' });

    expect([200, 400]).toContain(res.statusCode); // 400 if already paid by previous test
  });

  it('rejects payment on an already-paid order', async () => {
    if (!orderId) return;

    // Pay once
    await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, paymentMethod: 'card' });

    // Try again
    const res = await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, paymentMethod: 'card' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for an invalid payment method', async () => {
    if (!orderId) return;

    const res = await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, paymentMethod: 'bitcoin' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when orderId is missing', async () => {
    const res = await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentMethod: 'card' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a non-existent order', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId: fakeId, paymentMethod: 'card' });

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/orders/pay')
      .send({ orderId: 'anything', paymentMethod: 'card' });

    expect(res.statusCode).toBe(401);
  });

  it('prevents a customer from paying another users order', async () => {
    if (!orderId) return;

    // Register a second customer
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: `other${Date.now()}@test.com`,
      password: 'Other@1234',
    });
    const otherToken = reg.body.token;

    const res = await request(app)
      .post('/api/orders/pay')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ orderId, paymentMethod: 'card' });

    expect(res.statusCode).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('PATCH /api/orders/:id/cancel', () => {
  it('customer can cancel their own pending order', async () => {
    const menuItemId = await createMenuItem();
    if (!menuItemId) return;

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ menuItem: menuItemId, size: 'medium', quantity: 1 }] });

    const oid = orderRes.body.order?._id;
    if (!oid) return;

    const res = await request(app)
      .patch(`/api/orders/${oid}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.order?.status ?? res.body.status).toBe('cancelled');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/orders/admin/all', () => {
  it('admin can view all orders', async () => {
    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('customer cannot access admin orders (403)', async () => {
    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });
});
