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
