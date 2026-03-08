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
