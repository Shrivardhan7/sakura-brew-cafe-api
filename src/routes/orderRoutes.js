const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validators');
const { orderLimiter } = require('../middleware/rateLimiter');
const { processPayment } = require('../controllers/paymentController');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Place and manage café orders
 */

router.use(protect);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 loyaltyPointsEarned:
 *                   type: integer
 *                   example: 137
 *                 estimatedWaitTime:
 *                   type: string
 *                   example: 15 minutes
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', orderLimiter, validateOrder, c.placeOrder);

/**
 * @swagger
 * /api/orders/pay:
 *   post:
 *     tags: [Orders]
 *     summary: Process payment for an order
 *     description: |
 *       Simulates a café payment. Accepted methods: `card`, `cash`, `digital_wallet`, `loyalty_points`.
 *       Returns a transaction receipt on success.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *           examples:
 *             card:
 *               summary: Pay by card
 *               value:
 *                 orderId: "64f1a2b3c4d5e6f7a8b9c0d4"
 *                 paymentMethod: card
 *             cash:
 *               summary: Pay with cash
 *               value:
 *                 orderId: "64f1a2b3c4d5e6f7a8b9c0d4"
 *                 paymentMethod: cash
 *     responses:
 *       200:
 *         description: Payment processed — receipt returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Invalid request or order already paid
 *       402:
 *         description: Payment declined
 *       404:
 *         description: Order not found
 */
router.post('/pay', processPayment);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user's orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, completed, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', c.getUserOrders);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All orders
 *       403:
 *         description: Admin only
 */
router.get('/admin/all', restrictTo('admin'), c.getAllOrders);

/**
 * @swagger
 * /api/orders/admin/stats:
 *   get:
 *     tags: [Orders]
 *     summary: Get order statistics (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order stats
 *       403:
 *         description: Admin only
 */
router.get('/admin/stats', restrictTo('admin'), c.getOrderStats);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a single order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order detail
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.get('/:id', c.getOrder);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel a pending or confirmed order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Cannot cancel at this status
 */
router.patch('/:id/cancel', c.cancelOrder);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (admin only)
 *     description: "Valid flow: pending → confirmed → preparing → ready → completed"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, preparing, ready, completed, cancelled]
 *                 example: preparing
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Admin only
 */
router.patch('/:id/status', restrictTo('admin'), validateOrderStatus, c.updateOrderStatus);

module.exports = router;
