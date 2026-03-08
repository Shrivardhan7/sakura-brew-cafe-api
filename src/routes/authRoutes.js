const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration, login, and profile management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Account created — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       409:
 *         description: Email already registered
 */
router.post('/register', validateRegister, c.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive a JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Admin account (seeded)
 *               value:
 *                 email: admin@sakurabrew.cafe
 *                 password: Admin@Sakura123
 *             customer:
 *               summary: Sample customer (seeded)
 *               value:
 *                 email: hana@example.com
 *                 password: Customer@123
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validateLogin, c.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get currently authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, c.getMe);

/**
 * @swagger
 * /api/auth/preferences:
 *   patch:
 *     tags: [Auth]
 *     summary: Update language and theme preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [en, jp]
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *     responses:
 *       200:
 *         description: Preferences updated
 *       401:
 *         description: Unauthorized
 */
router.patch('/preferences', protect, c.updatePreferences);

/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     tags: [Auth]
 *     summary: Update display name
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yuki Sato
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', protect, c.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change account password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Current password incorrect
 */
router.patch('/change-password', protect, c.changePassword);

module.exports = router;
