const SIZES = {
  SMALL: { code: 'small', label: { en: 'Small', jp: '小' } },
  MEDIUM: { code: 'medium', label: { en: 'Medium', jp: '中' } },
  LARGE: { code: 'large', label: { en: 'Large', jp: '大' } },
};
const DRINK_CATEGORIES = ['coffee','chai','matcha','frost','smoothie','milkshake','tea','seasonal'];
const SNACK_CATEGORIES = ['sandwich','toast','pastry','cake','cookie','japanese_snack'];
const ALL_CATEGORIES = [...DRINK_CATEGORIES, ...SNACK_CATEGORIES];
const ITEM_TYPES = ['drink', 'snack'];
const USER_ROLES = ['customer', 'admin'];
const LANGUAGES = ['en', 'jp'];
const THEMES = ['light', 'dark'];
const ORDER_STATUSES = ['pending','confirmed','preparing','ready','completed','cancelled'];
const ADDON_CATEGORIES = ['milk_alternative','topping','shot','sweetener','syrup','extra'];
module.exports = { SIZES, DRINK_CATEGORIES, SNACK_CATEGORIES, ALL_CATEGORIES, ITEM_TYPES, USER_ROLES, LANGUAGES, THEMES, ORDER_STATUSES, ADDON_CATEGORIES };
