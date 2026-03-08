require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addonRoutes = require('./routes/addonRoutes');

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(
  helmet({
    // Allow Swagger UI to load its assets
    contentSecurityPolicy: false,
  })
);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Swagger Docs ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: API welcome message
 *     security: []
 *     responses:
 *       200:
 *         description: Welcome message
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: '🌸 Sakura Brew Café API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #e8a4a0; }
      .swagger-ui .topbar-wrapper img { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext y='22' font-size='18' fill='white'%3E🌸 Sakura Brew%3C/text%3E%3C/svg%3E"); }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  })
);

// Expose raw Swagger JSON for external tools
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Health Check ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Server health status
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 uptime:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Sakura Brew Café API 🌸',
    messageJp: 'さくらブリューカフェ APIへようこそ 🌸',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      addons: '/api/addons',
      docs: '/api-docs',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addons', addonRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('\n🌸 ==========================================');
      console.log('      Sakura Brew Café API 🌸');
      console.log('==========================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📖 API Docs:     http://localhost:${PORT}/api-docs`);
      console.log('==========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
