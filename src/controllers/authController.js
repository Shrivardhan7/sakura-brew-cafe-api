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
