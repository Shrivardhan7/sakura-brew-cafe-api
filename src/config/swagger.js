const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🌸 Sakura Brew Café API',
      version: '1.0.0',
      description: `
A modern Japanese-themed café ordering REST API.

## Authentication
Most endpoints require a **Bearer JWT token**.
1. Register or login via \`/api/auth\`
2. Copy the \`token\` from the response
3. Click **Authorize** and enter: \`Bearer <your-token>\`

## Multilingual Support
Add \`?lang=jp\` to any menu endpoint for Japanese responses.

## Role Access
- **customer** — browse menu, place & manage own orders
- **admin** — full CRUD on menu, addons, and all orders
      `,
      contact: {
        name: 'Sakura Brew Café',
        email: 'admin@sakurabrew.cafe',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Docker Container',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter: Bearer <your-jwt-token>',
        },
      },
      schemas: {
        // ── Auth ────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Yuki Tanaka' },
            email: { type: 'string', format: 'email', example: 'yuki@example.com' },
            password: { type: 'string', example: 'Yuki@1234' },
            preferences: {
              type: 'object',
              properties: {
                language: { type: 'string', enum: ['en', 'jp'], example: 'jp' },
                theme: { type: 'string', enum: ['light', 'dark'], example: 'dark' },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@sakurabrew.cafe' },
            password: { type: 'string', example: 'Admin@Sakura123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Irasshaimase! 🌸' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Yuki Tanaka' },
            email: { type: 'string', example: 'yuki@example.com' },
            role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
            preferences: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'jp' },
                theme: { type: 'string', example: 'dark' },
              },
            },
            loyaltyPoints: { type: 'number', example: 250 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Menu ────────────────────────────────────────────────────────────
        MenuItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
            name: {
              type: 'object',
              properties: {
                en: { type: 'string', example: 'Matcha Latte' },
                jp: { type: 'string', example: '抹茶ラテ' },
              },
            },
            description: {
              type: 'object',
              properties: {
                en: { type: 'string', example: 'Creamy matcha latte' },
                jp: { type: 'string', example: 'クリーミーな抹茶ラテ' },
              },
            },
            category: { type: 'string', example: 'matcha' },
            itemType: { type: 'string', enum: ['drink', 'snack'], example: 'drink' },
            sizes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  size: { type: 'string', enum: ['small', 'medium', 'large'] },
                  price: { type: 'number', example: 5.25 },
                },
              },
            },
            isAvailable: { type: 'boolean', example: true },
            isSeasonal: { type: 'boolean', example: false },
            isVegetarian: { type: 'boolean', example: true },
            tags: { type: 'array', items: { type: 'string' }, example: ['matcha', 'hot', 'japanese'] },
          },
        },
        // ── Addon ───────────────────────────────────────────────────────────
        Addon: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d3' },
            name: {
              type: 'object',
              properties: {
                en: { type: 'string', example: 'Oat Milk' },
                jp: { type: 'string', example: 'オーツミルク' },
              },
            },
            category: {
              type: 'string',
              enum: ['milk_alternative', 'topping', 'shot', 'sweetener', 'syrup', 'extra'],
              example: 'milk_alternative',
            },
            price: { type: 'number', example: 0.75 },
            isAvailable: { type: 'boolean', example: true },
          },
        },
        // ── Order ───────────────────────────────────────────────────────────
        OrderRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['menuItem', 'quantity'],
                properties: {
                  menuItem: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
                  size: { type: 'string', enum: ['small', 'medium', 'large'], example: 'medium' },
                  quantity: { type: 'integer', example: 1 },
                  addons: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['64f1a2b3c4d5e6f7a8b9c0d3'],
                  },
                  specialInstructions: { type: 'string', example: 'Extra hot please' },
                },
              },
            },
            specialNotes: { type: 'string', example: 'No sugar in drinks' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string', example: 'SBC-M0F3K2-AB9X' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
              example: 'pending',
            },
            paymentStatus: {
              type: 'string',
              enum: ['unpaid', 'paid', 'refunded'],
              example: 'unpaid',
            },
            subtotal: { type: 'number', example: 12.75 },
            tax: { type: 'number', example: 1.02 },
            totalAmount: { type: 'number', example: 13.77 },
            estimatedReadyTime: { type: 'string', format: 'date-time' },
          },
        },
        // ── Payment ─────────────────────────────────────────────────────────
        PaymentRequest: {
          type: 'object',
          required: ['orderId', 'paymentMethod'],
          properties: {
            orderId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d4' },
            paymentMethod: {
              type: 'string',
              enum: ['card', 'cash', 'digital_wallet', 'loyalty_points'],
              example: 'card',
            },
          },
        },
        PaymentResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Payment processed successfully 🌸' },
            receipt: {
              type: 'object',
              properties: {
                transactionRef: { type: 'string', example: 'TXN-M0F3K2-AB9X' },
                orderId: { type: 'string' },
                orderNumber: { type: 'string', example: 'SBC-M0F3K2-AB9X' },
                paymentMethod: { type: 'string', example: 'card' },
                paymentStatus: { type: 'string', example: 'paid' },
                amountCharged: { type: 'number', example: 13.77 },
                currency: { type: 'string', example: 'USD' },
                paidAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        // ── Error ───────────────────────────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
