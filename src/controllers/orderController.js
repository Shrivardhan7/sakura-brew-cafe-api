const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Addon = require('../models/Addon');
const User = require('../models/User');
exports.placeOrder = async (req, res, next) => {
  try {
    const { items, specialNotes } = req.body;
    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const mi = await MenuItem.findById(it.menuItem);
      if (!mi) return res.status(404).json({ success: false, message: 'Item not found: ' + it.menuItem });
      if (!mi.isAvailable) return res.status(400).json({ success: false, message: mi.name.en + ' is unavailable' });
      let basePrice = mi.price || 0;
      let sizeLabel = {};
      if (mi.itemType === 'drink') {
        if (!it.size) return res.status(400).json({ success: false, message: 'Size required for: ' + mi.name.en });
        const so = mi.sizes.find(s => s.size === it.size);
        if (!so) return res.status(400).json({ success: false, message: 'Invalid size for ' + mi.name.en });
        basePrice = so.price;
        sizeLabel = { code: so.size, label: { en: so.size, jp: so.size } };
      }
      let addonsTotal = 0;
      const addonDetails = [];
      for (const aid of (it.addons || [])) {
        const addon = await Addon.findById(aid);
        if (!addon || !addon.isAvailable) return res.status(400).json({ success: false, message: 'Add-on unavailable: ' + aid });
        addonsTotal += addon.price;
        addonDetails.push({ addon: addon._id, name: addon.name, price: addon.price });
      }
      const itemTotal = (basePrice + addonsTotal) * (it.quantity || 1);
      subtotal += itemTotal;
      orderItems.push({ menuItem: mi._id, itemName: mi.name, itemType: mi.itemType, size: sizeLabel, addons: addonDetails, quantity: it.quantity || 1, basePrice, addonsTotal, itemTotal, specialInstructions: it.specialInstructions });
    }
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const totalAmount = parseFloat((subtotal + tax).toFixed(2));
    const estimatedReadyTime = new Date(Date.now() + 15 * 60000);
    const order = await Order.create({ user: req.user._id, items: orderItems, subtotal, tax, totalAmount, specialNotes, estimatedReadyTime });
    const pts = Math.floor(totalAmount * 10);
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: pts } });
    res.status(201).json({ success: true, message: 'Order placed! Thank you!', order, loyaltyPointsEarned: pts, estimatedWaitTime: '15 minutes' });
  } catch(e) { next(e); }
};
exports.getUserOrders = async (req, res, next) => {
  try {
    const { page=1, limit=10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, orders });
  } catch(e) { next(e); }
};
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name').populate('items.addons.addon', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Forbidden' });
    res.json({ success: true, order });
  } catch(e) { next(e); }
};
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    if (!['pending','confirmed'].includes(order.status)) return res.status(400).json({ success: false, message: 'Cannot cancel order with status: ' + order.status });
    order.status = 'cancelled'; await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch(e) { next(e); }
};
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page=1, limit=20, status } = req.query;
    const filter = {}; if (status) filter.status = status;
    const orders = await Order.find(filter).populate('user','name email').sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, orders });
  } catch(e) { next(e); }
};
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = req.body.status;
    if (req.body.status === 'completed') { order.completedAt = new Date(); order.paymentStatus = 'paid'; }
    await order.save();
    res.json({ success: true, message: 'Status updated to ' + order.status, order });
  } catch(e) { next(e); }
};
exports.getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }]);
    res.json({ success: true, stats });
  } catch(e) { next(e); }
};
