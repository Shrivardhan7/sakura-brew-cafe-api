const mongoose = require('mongoose');
const addonSchema = new mongoose.Schema({
  name: { en: { type: String, required: true }, jp: { type: String, required: true } },
  category: { type: String, enum: ['milk_alternative','topping','shot','sweetener','syrup','extra'], required: true },
  price: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
  description: { en: String, jp: String },
}, { timestamps: true });
module.exports = mongoose.model('Addon', addonSchema);
