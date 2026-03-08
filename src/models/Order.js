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
