/**
 * Sakura Brew Café — Bootstrap Script
 * Run: node bootstrap.js
 * Creates all missing src/ files in one shot.
 */
const fs = require('fs');
const path = require('path');

function write(filePath, content) {
  const full = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, content.trimStart(), 'utf8');
    console.log('✅ Created:', filePath);
  } else {
    console.log('⏭️  Exists, skipping:', filePath);
  }
}

// ── src/config/constants.js ──────────────────────────────────────────────────
write('src/config/constants.js', `
const SIZES = {
  SMALL: { code: 'small', label: { en: 'Small', jp: '小' } },
  MEDIUM: { code: 'medium', label: { en: 'Medium', jp: '中' } },
  LARGE: { code: 'large', label: { en: 'Large', jp: '大' } },
};
const DRINK_CATEGORIES = ['coffee','chai','matcha','frost','smoothie','milkshake','tea','seasonal'];
const SNACK_CATEGORIES = ['sandwich','toast','pastry','cake','cookie','japanese_snack'];
const ALL_CATEGORIES = [...DRINK_CATEGORIES, ...SNACK_CATEGORIES];
const ITEM_TYPES = ['drink', 'snack'];
const USER_ROLES = ['customer', 'admin'];
const LANGUAGES = ['en', 'jp'];
const THEMES = ['light', 'dark'];
const ORDER_STATUSES = ['pending','confirmed','preparing','ready','completed','cancelled'];
const ADDON_CATEGORIES = ['milk_alternative','topping','shot','sweetener','syrup','extra'];
module.exports = { SIZES, DRINK_CATEGORIES, SNACK_CATEGORIES, ALL_CATEGORIES, ITEM_TYPES, USER_ROLES, LANGUAGES, THEMES, ORDER_STATUSES, ADDON_CATEGORIES };
`);

// ── src/config/database.js ───────────────────────────────────────────────────
write('src/config/database.js', `
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌸 MongoDB Connected: ' + conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Error: ' + error.message);
    process.exit(1);
  }
};
module.exports = connectDB;
`);

// ── src/models/User.js ───────────────────────────────────────────────────────
write('src/models/User.js', `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['customer','admin'], default: 'customer' },
  preferences: {
    language: { type: String, enum: ['en','jp'], default: 'en' },
    theme: { type: String, enum: ['light','dark'], default: 'light' },
  },
  loyaltyPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};
userSchema.methods.toPublicJSON = function() {
  return { id: this._id, name: this.name, email: this.email, role: this.role, preferences: this.preferences, loyaltyPoints: this.loyaltyPoints, createdAt: this.createdAt };
};
module.exports = mongoose.model('User', userSchema);
`);

// ── src/models/Addon.js ──────────────────────────────────────────────────────
write('src/models/Addon.js', `
const mongoose = require('mongoose');
const addonSchema = new mongoose.Schema({
  name: { en: { type: String, required: true }, jp: { type: String, required: true } },
  category: { type: String, enum: ['milk_alternative','topping','shot','sweetener','syrup','extra'], required: true },
  price: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
  description: { en: String, jp: String },
}, { timestamps: true });
module.exports = mongoose.model('Addon', addonSchema);
`);

// ── src/models/MenuItem.js ───────────────────────────────────────────────────
write('src/models/MenuItem.js', `
const mongoose = require('mongoose');
const { ALL_CATEGORIES } = require('../config/constants');
const sizeSchema = new mongoose.Schema({ size: { type: String, enum: ['small','medium','large'] }, price: { type: Number, required: true, min: 0 } }, { _id: false });
const menuItemSchema = new mongoose.Schema({
  name: { en: { type: String, required: true }, jp: { type: String, required: true } },
  description: { en: String, jp: String },
  category: { type: String, enum: ALL_CATEGORIES, required: true },
  itemType: { type: String, enum: ['drink','snack'], required: true },
  sizes: [sizeSchema],
  price: Number,
  isAvailable: { type: Boolean, default: true },
  isSeasonal: { type: Boolean, default: false },
  isVegetarian: { type: Boolean, default: false },
  tags: [String],
  image: String,
}, { timestamps: true });
module.exports = mongoose.model('MenuItem', menuItemSchema);
`);

// ── src/models/Order.js ──────────────────────────────────────────────────────
write('src/models/Order.js', `
const mongoose = require('mongoose');
const { ORDER_STATUSES } = require('../config/constants');
const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  itemName: { en: String, jp: String },
  itemType: { type: String, enum: ['drink','snack'] },
  size: { code: String, label: { en: String, jp: String } },
  addons: [{ addon: { type: mongoose.Schema.Types.ObjectId, ref: 'Addon' }, name: { en: String, jp: String }, price: { type: Number, default: 0 } }],
  quantity: { type: Number, default: 1, min: 1, max: 20 },
  basePrice: { type: Number, required: true },
  addonsTotal: { type: Number, default: 0 },
  itemTotal: { type: Number, required: true },
  specialInstructions: String,
}, { _id: false });
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentStatus: { type: String, enum: ['unpaid','paid','refunded'], default: 'unpaid' },
  paymentMethod: String,
  specialNotes: String,
  estimatedReadyTime: Date,
  completedAt: Date,
}, { timestamps: true });
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substr(2,4).toUpperCase();
    this.orderNumber = 'SBC-' + ts + '-' + rand;
  }
  next();
});
module.exports = mongoose.model('Order', orderSchema);
`);

// ── src/middleware/auth.js ───────────────────────────────────────────────────
write('src/middleware/auth.js', `
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
      token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
  next();
};
module.exports = { protect, restrictTo };
`);

// ── src/middleware/errorHandler.js ───────────────────────────────────────────
write('src/middleware/errorHandler.js', `
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.name === 'ValidationError') { statusCode = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { statusCode = 409; message = 'Duplicate value: ' + JSON.stringify(err.keyValue); }
  if (err.name === 'CastError') { statusCode = 400; message = 'Invalid ID format'; }
  res.status(statusCode).json({ success: false, message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};
const notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found: ' + req.originalUrl });
module.exports = { errorHandler, notFound };
`);

// ── src/middleware/rateLimiter.js ────────────────────────────────────────────
write('src/middleware/rateLimiter.js', `
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({ windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, message: { success: false, message: 'Too many requests' } });
const authLimiter = rateLimit({ windowMs: 900000, max: 10, message: { success: false, message: 'Too many auth attempts' } });
const orderLimiter = rateLimit({ windowMs: 60000, max: 10, message: { success: false, message: 'Too many orders' } });
module.exports = { apiLimiter, authLimiter, orderLimiter };
`);

// ── src/middleware/validators.js ─────────────────────────────────────────────
write('src/middleware/validators.js', `
const { body, validationResult } = require('express-validator');
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  next();
};
const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
];
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate,
];
const validateMenuItem = [
  body('name.en').notEmpty().withMessage('English name required'),
  body('name.jp').notEmpty().withMessage('Japanese name required'),
  body('category').notEmpty().withMessage('Category required'),
  body('itemType').isIn(['drink','snack']).withMessage('itemType must be drink or snack'),
  validate,
];
const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.menuItem').notEmpty().withMessage('menuItem ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate,
];
const validateOrderStatus = [
  body('status').isIn(['pending','confirmed','preparing','ready','completed','cancelled']).withMessage('Invalid status'),
  validate,
];
module.exports = { validateRegister, validateLogin, validateMenuItem, validateOrder, validateOrderStatus };
`);

// ── src/controllers/authController.js ───────────────────────────────────────
write('src/controllers/authController.js', `
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, preferences } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, preferences });
    res.status(201).json({ success: true, message: 'Welcome to Sakura Brew Cafe!', token: genToken(user._id), user: user.toPublicJSON() });
  } catch(e) { next(e); }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    user.lastLogin = new Date(); await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Irasshaimase!', token: genToken(user._id), user: user.toPublicJSON() });
  } catch(e) { next(e); }
};
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: user.toPublicJSON() });
  } catch(e) { next(e); }
};
exports.updatePreferences = async (req, res, next) => {
  try {
    const { language, theme } = req.body;
    const upd = {};
    if (language) upd['preferences.language'] = language;
    if (theme) upd['preferences.theme'] = theme;
    const user = await User.findByIdAndUpdate(req.user._id, { $set: upd }, { new: true });
    res.json({ success: true, message: 'Preferences updated', preferences: user.preferences });
  } catch(e) { next(e); }
};
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name }, { new: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch(e) { next(e); }
};
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords required' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword; await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch(e) { next(e); }
};
`);

// ── src/controllers/menuController.js ───────────────────────────────────────
write('src/controllers/menuController.js', `
const MenuItem = require('../models/MenuItem');
exports.getAllMenu = async (req, res, next) => {
  try {
    const { lang='en', category, itemType, isSeasonal, search, page=1, limit=50 } = req.query;
    const filter = { isAvailable: true };
    if (category) filter.category = category;
    if (itemType) filter.itemType = itemType;
    if (isSeasonal !== undefined) filter.isSeasonal = isSeasonal === 'true';
    if (search) filter.$or = [{ 'name.en': { $regex: search, $options: 'i' } }, { 'name.jp': { $regex: search, $options: 'i' } }, { tags: { $in: [search.toLowerCase()] } }];
    const items = await MenuItem.find(filter).skip((page-1)*limit).limit(parseInt(limit));
    const total = await MenuItem.countDocuments(filter);
    const menu = {};
    items.forEach(item => {
      const cat = item.category;
      if (!menu[cat]) menu[cat] = [];
      menu[cat].push({ ...item.toObject(), displayName: item.name[lang] || item.name.en });
    });
    res.json({ success: true, language: lang, total, page: parseInt(page), menu });
  } catch(e) { next(e); }
};
exports.getMenuItem = async (req, res, next) => {
  try {
    const { lang='en' } = req.query;
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, menuItem: { ...item.toObject(), displayName: item.name[lang] || item.name.en } });
  } catch(e) { next(e); }
};
exports.getByCategory = async (req, res, next) => {
  try {
    const { lang='en' } = req.query;
    const items = await MenuItem.find({ category: req.params.category, isAvailable: true });
    res.json({ success: true, category: req.params.category, items: items.map(i => ({ ...i.toObject(), displayName: i.name[lang] || i.name.en })) });
  } catch(e) { next(e); }
};
exports.getSeasonalItems = async (req, res, next) => {
  try {
    const { lang='en' } = req.query;
    const items = await MenuItem.find({ isSeasonal: true, isAvailable: true });
    res.json({ success: true, items: items.map(i => ({ ...i.toObject(), displayName: i.name[lang] || i.name.en })) });
  } catch(e) { next(e); }
};
exports.getCategories = async (req, res, next) => {
  try {
    const cats = await MenuItem.distinct('category');
    res.json({ success: true, categories: cats });
  } catch(e) { next(e); }
};
exports.createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: 'Menu item created', menuItem: item });
  } catch(e) { next(e); }
};
exports.updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, menuItem: item });
  } catch(e) { next(e); }
};
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch(e) { next(e); }
};
exports.toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, message: 'Availability toggled', isAvailable: item.isAvailable });
  } catch(e) { next(e); }
};
`);

// ── src/controllers/orderController.js ──────────────────────────────────────
write('src/controllers/orderController.js', `
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
`);

// ── src/controllers/addonController.js ──────────────────────────────────────
write('src/controllers/addonController.js', `
const Addon = require('../models/Addon');
exports.getAllAddons = async (req, res, next) => {
  try {
    const { lang='en', category } = req.query;
    const filter = { isAvailable: true };
    if (category) filter.category = category;
    const addons = await Addon.find(filter);
    res.json({ success: true, addons: addons.map(a => ({ ...a.toObject(), displayName: a.name[lang] || a.name.en })) });
  } catch(e) { next(e); }
};
exports.getAddon = async (req, res, next) => {
  try {
    const addon = await Addon.findById(req.params.id);
    if (!addon) return res.status(404).json({ success: false, message: 'Addon not found' });
    res.json({ success: true, addon });
  } catch(e) { next(e); }
};
exports.createAddon = async (req, res, next) => {
  try {
    const addon = await Addon.create(req.body);
    res.status(201).json({ success: true, addon });
  } catch(e) { next(e); }
};
exports.updateAddon = async (req, res, next) => {
  try {
    const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!addon) return res.status(404).json({ success: false, message: 'Addon not found' });
    res.json({ success: true, addon });
  } catch(e) { next(e); }
};
exports.deleteAddon = async (req, res, next) => {
  try {
    const addon = await Addon.findByIdAndDelete(req.params.id);
    if (!addon) return res.status(404).json({ success: false, message: 'Addon not found' });
    res.json({ success: true, message: 'Addon deleted' });
  } catch(e) { next(e); }
};
`);

// ── .env (only if missing) ───────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, `PORT=5000\nNODE_ENV=development\nMONGODB_URI=mongodb://localhost:27017/sakura-brew-cafe\nJWT_SECRET=sakura_brew_super_secret_jwt_key_2026\nJWT_EXPIRES_IN=7d\nADMIN_EMAIL=admin@sakurabrew.cafe\nADMIN_PASSWORD=Admin@Sakura123\n`);
  console.log('✅ Created: .env');
} else {
  console.log('⏭️  .env already exists');
}

console.log('\n🌸 Bootstrap complete! Now run:');
console.log('   node src/server.js');
