const Order = require('../models/Order');

const ACCEPTED_METHODS = ['card', 'cash', 'digital_wallet', 'loyalty_points'];

/**
 * POST /api/orders/pay
 * Simulates a café order payment.
 */
exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;

    // ── Validate input ───────────────────────────────────────────────────────
    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'orderId and paymentMethod are required',
        messageJp: 'orderId と paymentMethod は必須です',
      });
    }

    if (!ACCEPTED_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Accepted: ${ACCEPTED_METHODS.join(', ')}`,
        messageJp: '無効な支払い方法です',
      });
    }

    // ── Fetch order ──────────────────────────────────────────────────────────
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        messageJp: 'ご注文が見つかりません',
      });
    }

    // ── Ownership check (customer can only pay their own order) ──────────────
    if (
      req.user.role !== 'admin' &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pay for this order',
        messageJp: 'このご注文のお支払い権限がありません',
      });
    }

    // ── Guard: already paid ──────────────────────────────────────────────────
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid',
        messageJp: 'このご注文はすでにお支払い済みです',
      });
    }

    // ── Guard: cancelled orders cannot be paid ───────────────────────────────
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for a cancelled order',
        messageJp: 'キャンセルされたご注文はお支払いできません',
      });
    }

    // ── Simulate payment processing ──────────────────────────────────────────
    const simulateFailure =
      process.env.NODE_ENV !== 'test' && Math.random() < 0.02; // 2% failure in dev

    if (simulateFailure) {
      return res.status(402).json({
        success: false,
        message: 'Payment declined. Please try a different payment method.',
        messageJp: 'お支払いが拒否されました。別の方法をお試しください。',
        paymentStatus: 'failed',
      });
    }

    // ── Update order ─────────────────────────────────────────────────────────
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;

    // Auto-confirm if still pending
    if (order.status === 'pending') {
      order.status = 'confirmed';
    }

    await order.save();

    // ── Build receipt ─────────────────────────────────────────────────────────
    const transactionRef = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully 🌸',
      messageJp: 'お支払いが完了しました 🌸',
      receipt: {
        transactionRef,
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        amountCharged: order.totalAmount,
        currency: order.currency,
        paidAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};
