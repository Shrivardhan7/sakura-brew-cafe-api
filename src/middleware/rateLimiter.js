const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({ windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, message: { success: false, message: 'Too many requests' } });
const authLimiter = rateLimit({ windowMs: 900000, max: 10, message: { success: false, message: 'Too many auth attempts' } });
const orderLimiter = rateLimit({ windowMs: 60000, max: 10, message: { success: false, message: 'Too many orders' } });
module.exports = { apiLimiter, authLimiter, orderLimiter };
