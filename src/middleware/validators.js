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
