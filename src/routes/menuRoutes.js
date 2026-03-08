const router = require('express').Router();
const c = require('../controllers/menuController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateMenuItem } = require('../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Browse and manage café menu items
 */

/**
 * @swagger
 * /api/menu:
 *   get:
 *     tags: [Menu]
 *     summary: Get all menu items (grouped by category)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, jp]
 *         description: Response language (default en)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: "Filter by category (e.g. matcha, coffee, japanese_snack)"
 *       - in: query
 *         name: itemType
 *         schema:
 *           type: string
 *           enum: [drink, snack]
 *       - in: query
 *         name: isSeasonal
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or tag
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Menu items grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                   example: 52
 *                 menu:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/MenuItem'
 */
router.get('/', c.getAllMenu);

/**
 * @swagger
 * /api/menu/categories:
 *   get:
 *     tags: [Menu]
 *     summary: Get all available menu categories
 *     security: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', c.getCategories);

/**
 * @swagger
 * /api/menu/seasonal:
 *   get:
 *     tags: [Menu]
 *     summary: Get seasonal menu items
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, jp]
 *     responses:
 *       200:
 *         description: Seasonal items
 */
router.get('/seasonal', c.getSeasonalItems);

/**
 * @swagger
 * /api/menu/category/{category}:
 *   get:
 *     tags: [Menu]
 *     summary: Get menu items by category
 *     security: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         example: matcha
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, jp]
 *     responses:
 *       200:
 *         description: Items in the given category
 */
router.get('/category/:category', c.getByCategory);

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     tags: [Menu]
 *     summary: Get a single menu item by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, jp]
 *     responses:
 *       200:
 *         description: Menu item detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Item not found
 */
router.get('/:id', c.getMenuItem);

/**
 * @swagger
 * /api/menu:
 *   post:
 *     tags: [Menu]
 *     summary: Create a new menu item (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *           example:
 *             name:
 *               en: Hojicha Latte
 *               jp: ほうじ茶ラテ
 *             description:
 *               en: Roasted green tea latte
 *               jp: 焙煎緑茶ラテ
 *             category: tea
 *             itemType: drink
 *             isVegetarian: true
 *             sizes:
 *               - size: small
 *                 price: 4.25
 *               - size: medium
 *                 price: 5.00
 *               - size: large
 *                 price: 5.50
 *             tags: [tea, japanese, roasted]
 *     responses:
 *       201:
 *         description: Menu item created
 *       403:
 *         description: Admin only
 */
router.post('/', protect, restrictTo('admin'), validateMenuItem, c.createMenuItem);

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     tags: [Menu]
 *     summary: Update a menu item (admin only)
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
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       200:
 *         description: Item updated
 *       403:
 *         description: Admin only
 *       404:
 *         description: Item not found
 */
router.put('/:id', protect, restrictTo('admin'), c.updateMenuItem);

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     tags: [Menu]
 *     summary: Delete a menu item (admin only)
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
 *         description: Item deleted
 *       403:
 *         description: Admin only
 */
router.delete('/:id', protect, restrictTo('admin'), c.deleteMenuItem);

/**
 * @swagger
 * /api/menu/{id}/availability:
 *   patch:
 *     tags: [Menu]
 *     summary: Toggle item availability (admin only)
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
 *         description: Availability toggled
 *       403:
 *         description: Admin only
 */
router.patch('/:id/availability', protect, restrictTo('admin'), c.toggleAvailability);

module.exports = router;
