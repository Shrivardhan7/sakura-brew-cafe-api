const router = require('express').Router();
const c = require('../controllers/addonController');
const { protect, restrictTo } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Addons
 *   description: Drink customisation add-ons (milk alternatives, syrups, toppings…)
 */

/**
 * @swagger
 * /api/addons:
 *   get:
 *     tags: [Addons]
 *     summary: Get all add-ons
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, jp]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [milk_alternative, topping, shot, sweetener, syrup, extra]
 *     responses:
 *       200:
 *         description: List of add-ons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 addons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Addon'
 */
router.get('/', c.getAllAddons);

/**
 * @swagger
 * /api/addons/{id}:
 *   get:
 *     tags: [Addons]
 *     summary: Get a single add-on by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Add-on detail
 *       404:
 *         description: Not found
 */
router.get('/:id', c.getAddon);

/**
 * @swagger
 * /api/addons:
 *   post:
 *     tags: [Addons]
 *     summary: Create a new add-on (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Addon'
 *           example:
 *             name:
 *               en: Black Sesame Paste
 *               jp: 黒ごまペースト
 *             category: topping
 *             price: 0.75
 *             description:
 *               en: Rich black sesame paste
 *               jp: リッチな黒ごまペースト
 *     responses:
 *       201:
 *         description: Add-on created
 *       403:
 *         description: Admin only
 */
router.post('/', protect, restrictTo('admin'), c.createAddon);

/**
 * @swagger
 * /api/addons/{id}:
 *   put:
 *     tags: [Addons]
 *     summary: Update an add-on (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Addon'
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Admin only
 */
router.put('/:id', protect, restrictTo('admin'), c.updateAddon);

/**
 * @swagger
 * /api/addons/{id}:
 *   delete:
 *     tags: [Addons]
 *     summary: Delete an add-on (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Admin only
 */
router.delete('/:id', protect, restrictTo('admin'), c.deleteAddon);

module.exports = router;
