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
