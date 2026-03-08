require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Addon = require('../models/Addon');

// ─── ADDONS ─────────────────────────────────────────────────────────────────
const addonsData = [
  // Milk Alternatives
  { name: { en: 'Soy Milk', jp: '豆乳' }, category: 'milk_alternative', price: 0.75, description: { en: 'Creamy soy milk', jp: 'クリーミーな豆乳' } },
  { name: { en: 'Almond Milk', jp: 'アーモンドミルク' }, category: 'milk_alternative', price: 0.75, description: { en: 'Light almond milk', jp: '軽いアーモンドミルク' } },
  { name: { en: 'Oat Milk', jp: 'オートミルク' }, category: 'milk_alternative', price: 0.75, description: { en: 'Smooth oat milk', jp: 'なめらかなオートミルク' } },
  { name: { en: 'Coconut Milk', jp: 'ココナッツミルク' }, category: 'milk_alternative', price: 0.75, description: { en: 'Tropical coconut milk', jp: 'トロピカルなココナッツミルク' } },
  // Toppings
  { name: { en: 'Whipped Cream', jp: 'ホイップクリーム' }, category: 'topping', price: 0.50, description: { en: 'Light whipped cream', jp: '軽いホイップクリーム' } },
  { name: { en: 'Chocolate Chips', jp: 'チョコチップ' }, category: 'topping', price: 0.50, description: { en: 'Mini chocolate chips', jp: 'ミニチョコチップ' } },
  { name: { en: 'Matcha Powder', jp: '抹茶パウダー' }, category: 'topping', price: 0.50, description: { en: 'Premium matcha dusting', jp: 'プレミアム抹茶ダスティング' } },
  { name: { en: 'Cinnamon Powder', jp: 'シナモンパウダー' }, category: 'topping', price: 0.25, description: { en: 'Ground cinnamon', jp: 'グラウンドシナモン' } },
  // Shots
  { name: { en: 'Extra Espresso Shot', jp: 'エスプレッソショット追加' }, category: 'shot', price: 1.00, description: { en: 'Single espresso shot', jp: 'シングルエスプレッソショット' } },
  { name: { en: 'Double Espresso Shot', jp: 'ダブルエスプレッソショット' }, category: 'shot', price: 1.75, description: { en: 'Double espresso shot', jp: 'ダブルエスプレッソショット' } },
  // Sweeteners
  { name: { en: 'Honey', jp: 'ハチミツ' }, category: 'sweetener', price: 0.50, description: { en: 'Natural honey', jp: '天然ハチミツ' } },
  { name: { en: 'Lemon', jp: 'レモン' }, category: 'sweetener', price: 0.25, description: { en: 'Fresh lemon slice', jp: '新鮮なレモンスライス' } },
  { name: { en: 'Agave Syrup', jp: 'アガベシロップ' }, category: 'sweetener', price: 0.50, description: { en: 'Natural agave sweetener', jp: 'ナチュラルアガベ甘味料' } },
  { name: { en: 'Brown Sugar', jp: '黒糖' }, category: 'sweetener', price: 0.25, description: { en: 'Rich brown sugar', jp: 'リッチな黒糖' } },
  // Syrups
  { name: { en: 'Caramel Syrup', jp: 'キャラメルシロップ' }, category: 'syrup', price: 0.75, description: { en: 'Sweet caramel syrup', jp: '甘いキャラメルシロップ' } },
  { name: { en: 'Vanilla Syrup', jp: 'バニラシロップ' }, category: 'syrup', price: 0.75, description: { en: 'Classic vanilla syrup', jp: 'クラシックバニラシロップ' } },
  { name: { en: 'Hazelnut Syrup', jp: 'ヘーゼルナッツシロップ' }, category: 'syrup', price: 0.75, description: { en: 'Hazelnut flavor syrup', jp: 'ヘーゼルナッツフレーバーシロップ' } },
  { name: { en: 'Sakura Syrup', jp: '桜シロップ' }, category: 'syrup', price: 1.00, description: { en: 'Seasonal cherry blossom syrup', jp: '季節の桜シロップ' } },
  { name: { en: 'Lavender Syrup', jp: 'ラベンダーシロップ' }, category: 'syrup', price: 0.75, description: { en: 'Floral lavender syrup', jp: 'フローラルラベンダーシロップ' } },
  // Extras
  { name: { en: 'Ice Cream Scoop', jp: 'アイスクリームスクープ' }, category: 'extra', price: 1.50, description: { en: 'Vanilla ice cream scoop', jp: 'バニラアイスクリームスクープ' } },
  { name: { en: 'Boba Pearls', jp: 'タピオカパール' }, category: 'extra', price: 1.00, description: { en: 'Chewy tapioca pearls', jp: 'モチモチタピオカパール' } },
];

// ─── MENU ITEMS ──────────────────────────────────────────────────────────────
const buildMenuItems = (addonIds) => {
  const allAddonIds = addonIds;

  return [
    // ── COFFEE ──────────────────────────────────────────────────────────────
    {
      name: { en: 'Americano', jp: 'アメリカーノ' },
      description: { en: 'Bold espresso diluted with hot water', jp: '濃厚エスプレッソをお湯で割ったコーヒー' },
      category: 'coffee', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.50 }, { size: 'medium', price: 4.00 }, { size: 'large', price: 4.50 }],
      tags: ['coffee', 'espresso', 'classic'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Café Latte', jp: 'カフェラテ' },
      description: { en: 'Smooth espresso with steamed milk', jp: 'なめらかなエスプレッソとスチームミルク' },
      category: 'coffee', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.00 }, { size: 'medium', price: 4.75 }, { size: 'large', price: 5.25 }],
      tags: ['coffee', 'latte', 'milk', 'classic'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Cappuccino', jp: 'カプチーノ' },
      description: { en: 'Espresso topped with airy foam and milk', jp: 'エスプレッソに泡立てたフォームミルクをのせた一杯' },
      category: 'coffee', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.00 }, { size: 'medium', price: 4.75 }, { size: 'large', price: 5.25 }],
      tags: ['coffee', 'foam', 'italian', 'classic'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Mocha', jp: 'モカ' },
      description: { en: 'Espresso blended with chocolate and steamed milk', jp: 'チョコレートとスチームミルクのエスプレッソ' },
      category: 'coffee', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.50 }, { size: 'medium', price: 5.25 }, { size: 'large', price: 5.75 }],
      tags: ['coffee', 'chocolate', 'indulgent'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Caramel Latte', jp: 'キャラメルラテ' },
      description: { en: 'Espresso and milk with rich caramel drizzle', jp: 'リッチなキャラメルソースのエスプレッソラテ' },
      category: 'coffee', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.75 }, { size: 'medium', price: 5.50 }, { size: 'large', price: 6.00 }],
      tags: ['coffee', 'caramel', 'sweet', 'popular'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Vanilla Latte', jp: 'バニララテ' },
      description: { en: 'Classic espresso latte with vanilla syrup', jp: 'バニラシロップ入りのクラシックエスプレッソラテ' },
      category: 'coffee', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.75 }, { size: 'medium', price: 5.50 }, { size: 'large', price: 6.00 }],
      tags: ['coffee', 'vanilla', 'sweet'], availableAddons: allAddonIds,
    },
    // ── CHAI ────────────────────────────────────────────────────────────────
    {
      name: { en: 'Masala Chai', jp: 'マサラチャイ' },
      description: { en: 'Spiced Indian tea with ginger, cardamom, and cinnamon', jp: 'ジンジャー、カルダモン、シナモン入りスパイスチャイ' },
      category: 'chai', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.75 }, { size: 'medium', price: 4.50 }, { size: 'large', price: 5.00 }],
      tags: ['chai', 'spiced', 'indian', 'warming'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Ginger Chai', jp: 'ジンジャーチャイ' },
      description: { en: 'Bold chai with extra fresh ginger kick', jp: 'フレッシュジンジャーをたっぷり使ったチャイ' },
      category: 'chai', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.75 }, { size: 'medium', price: 4.50 }, { size: 'large', price: 5.00 }],
      tags: ['chai', 'ginger', 'spicy', 'warming'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Cardamom Chai', jp: 'カルダモンチャイ' },
      description: { en: 'Aromatic chai with fragrant cardamom pods', jp: '香り豊かなカルダモン入りチャイ' },
      category: 'chai', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.75 }, { size: 'medium', price: 4.50 }, { size: 'large', price: 5.00 }],
      tags: ['chai', 'cardamom', 'aromatic'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Chai Latte', jp: 'チャイラテ' },
      description: { en: 'Spiced chai blended with creamy steamed milk', jp: 'スパイスチャイとクリーミーなスチームミルク' },
      category: 'chai', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.25 }, { size: 'medium', price: 5.00 }, { size: 'large', price: 5.50 }],
      tags: ['chai', 'latte', 'creamy', 'popular'], availableAddons: allAddonIds,
    },
    // ── MATCHA ──────────────────────────────────────────────────────────────
    {
      name: { en: 'Matcha Latte', jp: '抹茶ラテ' },
      description: { en: 'Premium ceremonial matcha whisked with steamed milk', jp: 'プレミアム茶道用抹茶とスチームミルク' },
      category: 'matcha', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.50 }, { size: 'medium', price: 5.25 }, { size: 'large', price: 5.75 }],
      tags: ['matcha', 'japanese', 'latte', 'popular', 'antioxidant'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Iced Matcha Latte', jp: 'アイス抹茶ラテ' },
      description: { en: 'Chilled matcha over ice with cold milk', jp: '氷とコールドミルクで作った冷たい抹茶ラテ' },
      category: 'matcha', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.75 }, { size: 'medium', price: 5.50 }, { size: 'large', price: 6.00 }],
      tags: ['matcha', 'iced', 'japanese', 'refreshing'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Matcha Frost', jp: '抹茶フロスト' },
      description: { en: 'Blended iced matcha beverage with creamy milk', jp: 'ブレンドした抹茶とクリーミーなミルクのフロスト' },
      category: 'matcha', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.00 }, { size: 'medium', price: 5.75 }, { size: 'large', price: 6.50 }],
      tags: ['matcha', 'blended', 'cold', 'japanese'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Matcha Smoothie', jp: '抹茶スムージー' },
      description: { en: 'Healthy matcha smoothie with banana and spinach', jp: 'バナナとほうれん草入りのヘルシー抹茶スムージー' },
      category: 'matcha', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.25 }, { size: 'medium', price: 6.00 }, { size: 'large', price: 6.75 }],
      tags: ['matcha', 'smoothie', 'healthy', 'green'], availableAddons: allAddonIds,
    },
    // ── FROST ───────────────────────────────────────────────────────────────
    {
      name: { en: 'Java Chip Frost', jp: 'ジャバチップフロスト' },
      description: { en: 'Blended espresso with chocolate chips and milk', jp: 'エスプレッソとチョコチップのブレンドドリンク' },
      category: 'frost', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.50 }, { size: 'medium', price: 6.25 }, { size: 'large', price: 7.00 }],
      tags: ['frost', 'blended', 'coffee', 'chocolate', 'popular'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Caramel Frost', jp: 'キャラメルフロスト' },
      description: { en: 'Iced blended caramel drink with whipped cream', jp: 'ホイップクリームのせキャラメルブレンドドリンク' },
      category: 'frost', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.50 }, { size: 'medium', price: 6.25 }, { size: 'large', price: 7.00 }],
      tags: ['frost', 'caramel', 'sweet', 'blended'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Mocha Frost', jp: 'モカフロスト' },
      description: { en: 'Blended mocha with chocolate sauce and ice', jp: 'チョコレートソースとアイスのブレンドモカ' },
      category: 'frost', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.50 }, { size: 'medium', price: 6.25 }, { size: 'large', price: 7.00 }],
      tags: ['frost', 'mocha', 'chocolate', 'blended'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Vanilla Frost', jp: 'バニラフロスト' },
      description: { en: 'Creamy blended vanilla milk drink with ice', jp: 'クリーミーなバニラミルクのブレンドドリンク' },
      category: 'frost', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.00 }, { size: 'medium', price: 5.75 }, { size: 'large', price: 6.50 }],
      tags: ['frost', 'vanilla', 'creamy', 'blended'], availableAddons: allAddonIds,
    },
    // ── SMOOTHIES ───────────────────────────────────────────────────────────
    {
      name: { en: 'Mango Smoothie', jp: 'マンゴースムージー' },
      description: { en: 'Fresh tropical mango blended to perfection', jp: 'フレッシュトロピカルマンゴーをブレンド' },
      category: 'smoothie', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.00 }, { size: 'medium', price: 5.75 }, { size: 'large', price: 6.50 }],
      tags: ['smoothie', 'mango', 'tropical', 'fresh'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Berry Smoothie', jp: 'ベリースムージー' },
      description: { en: 'Mixed berries blended with yogurt and honey', jp: 'ヨーグルトとハチミツを加えたミックスベリー' },
      category: 'smoothie', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.00 }, { size: 'medium', price: 5.75 }, { size: 'large', price: 6.50 }],
      tags: ['smoothie', 'berry', 'healthy', 'antioxidant'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Banana Smoothie', jp: 'バナナスムージー' },
      description: { en: 'Creamy banana smoothie with milk and honey', jp: 'ミルクとハチミツのクリーミーバナナスムージー' },
      category: 'smoothie', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 4.75 }, { size: 'medium', price: 5.50 }, { size: 'large', price: 6.25 }],
      tags: ['smoothie', 'banana', 'creamy', 'energy'], availableAddons: allAddonIds,
    },
    // ── MILKSHAKES ──────────────────────────────────────────────────────────
    {
      name: { en: 'Chocolate Shake', jp: 'チョコレートシェイク' },
      description: { en: 'Thick, rich chocolate milkshake with whipped cream', jp: 'ホイップクリームのせリッチチョコレートシェイク' },
      category: 'milkshake', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.50 }, { size: 'medium', price: 6.25 }, { size: 'large', price: 7.00 }],
      tags: ['milkshake', 'chocolate', 'indulgent', 'thick'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Vanilla Shake', jp: 'バニラシェイク' },
      description: { en: 'Classic creamy vanilla milkshake', jp: 'クラシッククリーミーバニラシェイク' },
      category: 'milkshake', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.25 }, { size: 'medium', price: 6.00 }, { size: 'large', price: 6.75 }],
      tags: ['milkshake', 'vanilla', 'classic', 'creamy'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Strawberry Shake', jp: 'ストロベリーシェイク' },
      description: { en: 'Fresh strawberry milkshake with real fruit', jp: '本物のフルーツを使ったフレッシュストロベリーシェイク' },
      category: 'milkshake', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.50 }, { size: 'medium', price: 6.25 }, { size: 'large', price: 7.00 }],
      tags: ['milkshake', 'strawberry', 'fruity', 'pink'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Matcha Shake', jp: '抹茶シェイク' },
      description: { en: 'Japanese-style matcha milkshake', jp: '日本風抹茶ミルクシェイク' },
      category: 'milkshake', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 5.75 }, { size: 'medium', price: 6.50 }, { size: 'large', price: 7.25 }],
      tags: ['milkshake', 'matcha', 'japanese', 'premium'], availableAddons: allAddonIds,
    },
    // ── TEA ─────────────────────────────────────────────────────────────────
    {
      name: { en: 'Hibiscus Tea', jp: 'ハイビスカスティー' },
      description: { en: 'Tart hibiscus flower tea, served hot or iced', jp: '酸味のあるハイビスカスフラワーティー' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.25 }, { size: 'medium', price: 3.75 }, { size: 'large', price: 4.25 }],
      tags: ['tea', 'hibiscus', 'floral', 'vitamin-c'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Chamomile Tea', jp: 'カモミールティー' },
      description: { en: 'Gentle and calming chamomile blossom tea', jp: 'やさしくリラックスできるカモミールティー' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.00 }, { size: 'medium', price: 3.50 }, { size: 'large', price: 4.00 }],
      tags: ['tea', 'chamomile', 'calming', 'herbal'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Butterfly Pea Blue Tea', jp: 'バタフライピーティー' },
      description: { en: 'Stunning blue tea from butterfly pea flowers', jp: 'バタフライピーの花から生まれた鮮やかなブルーティー' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.75 }, { size: 'medium', price: 4.25 }, { size: 'large', price: 4.75 }],
      tags: ['tea', 'blue', 'butterfly-pea', 'instagram', 'color-changing'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Rose Tea', jp: 'ローズティー' },
      description: { en: 'Delicate rose petal tea with a floral aroma', jp: '花の香りが漂う繊細なローズペタルティー' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.50 }, { size: 'medium', price: 4.00 }, { size: 'large', price: 4.50 }],
      tags: ['tea', 'rose', 'floral', 'romantic'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Mint Tea', jp: 'ミントティー' },
      description: { en: 'Refreshing peppermint herbal tea', jp: 'さわやかなペパーミントハーブティー' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.00 }, { size: 'medium', price: 3.50 }, { size: 'large', price: 4.00 }],
      tags: ['tea', 'mint', 'refreshing', 'herbal'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Sencha', jp: '煎茶' },
      description: { en: 'Traditional Japanese green tea with grassy notes', jp: '草のような香りの伝統的な日本の緑茶' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.50 }, { size: 'medium', price: 4.00 }, { size: 'large', price: 4.50 }],
      tags: ['tea', 'japanese', 'green', 'traditional', 'antioxidant'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Hojicha', jp: 'ほうじ茶' },
      description: { en: 'Roasted Japanese green tea with earthy warmth', jp: '香ばしく焙煎した日本の緑茶' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.50 }, { size: 'medium', price: 4.00 }, { size: 'large', price: 4.50 }],
      tags: ['tea', 'japanese', 'roasted', 'earthy', 'low-caffeine'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Earl Grey', jp: 'アールグレイ' },
      description: { en: 'Classic black tea with bergamot orange', jp: 'ベルガモットオレンジ入りのクラシック紅茶' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.25 }, { size: 'medium', price: 3.75 }, { size: 'large', price: 4.25 }],
      tags: ['tea', 'earl-grey', 'bergamot', 'classic', 'british'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Assam', jp: 'アッサム' },
      description: { en: 'Strong, malty Assam black tea from India', jp: 'インド産の力強くモルティなアッサム紅茶' },
      category: 'tea', itemType: 'drink', isVegetarian: true,
      sizes: [{ size: 'small', price: 3.25 }, { size: 'medium', price: 3.75 }, { size: 'large', price: 4.25 }],
      tags: ['tea', 'assam', 'black', 'strong', 'indian'], availableAddons: allAddonIds,
    },
    // ── SEASONAL ────────────────────────────────────────────────────────────
    {
      name: { en: 'Sakura Blossom Latte', jp: '桜ラテ' },
      description: { en: 'Limited spring latte with cherry blossom syrup', jp: '限定！桜シロップの春ラテ' },
      category: 'seasonal', itemType: 'drink', isVegetarian: true, isSeasonal: true,
      seasonalPeriod: { startMonth: 3, endMonth: 5, label: { en: 'Spring Special 🌸', jp: '春の特別メニュー 🌸' } },
      sizes: [{ size: 'small', price: 5.25 }, { size: 'medium', price: 6.00 }, { size: 'large', price: 6.75 }],
      tags: ['seasonal', 'sakura', 'spring', 'limited', 'floral'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Pumpkin Spice Latte', jp: 'パンプキンスパイスラテ' },
      description: { en: 'Autumn pumpkin spiced latte with cinnamon', jp: '秋のパンプキンスパイスラテ・シナモン入り' },
      category: 'seasonal', itemType: 'drink', isVegetarian: true, isSeasonal: true,
      seasonalPeriod: { startMonth: 9, endMonth: 11, label: { en: 'Autumn Special 🍂', jp: '秋の特別メニュー 🍂' } },
      sizes: [{ size: 'small', price: 5.25 }, { size: 'medium', price: 6.00 }, { size: 'large', price: 6.75 }],
      tags: ['seasonal', 'pumpkin', 'autumn', 'spiced', 'limited'], availableAddons: allAddonIds,
    },
    {
      name: { en: 'Yuzu Honey Tea', jp: 'ゆず蜂蜜茶' },
      description: { en: 'Warming winter yuzu citrus and honey tea', jp: '温かいゆずと蜂蜜のお茶' },
      category: 'seasonal', itemType: 'drink', isVegetarian: true, isSeasonal: true,
      seasonalPeriod: { startMonth: 12, endMonth: 2, label: { en: 'Winter Special ❄️', jp: '冬の特別メニュー ❄️' } },
      sizes: [{ size: 'small', price: 4.75 }, { size: 'medium', price: 5.50 }, { size: 'large', price: 6.00 }],
      tags: ['seasonal', 'yuzu', 'winter', 'citrus', 'warming'], availableAddons: allAddonIds,
    },
    // ── SANDWICHES ──────────────────────────────────────────────────────────
    {
      name: { en: 'Veg Sandwich', jp: 'ベジサンドイッチ' },
      description: { en: 'Fresh vegetables on artisan bread with pesto', jp: 'ペストとフレッシュ野菜のアルチザンブレッドサンドイッチ' },
      category: 'sandwich', itemType: 'snack', isVegetarian: true, basePrice: 6.50,
      tags: ['sandwich', 'vegetarian', 'healthy', 'fresh'],
    },
    {
      name: { en: 'Paneer Sandwich', jp: 'パニールサンドイッチ' },
      description: { en: 'Grilled paneer with spiced sauce and salad', jp: 'スパイシーソースとサラダのグリルパニールサンド' },
      category: 'sandwich', itemType: 'snack', isVegetarian: true, basePrice: 7.25,
      tags: ['sandwich', 'paneer', 'indian-inspired', 'protein'],
    },
    {
      name: { en: 'Grilled Cheese Sandwich', jp: 'グリルチーズサンドイッチ' },
      description: { en: 'Classic melted cheese sandwich on sourdough', jp: 'サワードウのクラシックチーズグリルサンドイッチ' },
      category: 'sandwich', itemType: 'snack', isVegetarian: true, basePrice: 6.00,
      tags: ['sandwich', 'cheese', 'classic', 'comfort-food'],
    },
    {
      name: { en: 'Avocado Sandwich', jp: 'アボカドサンドイッチ' },
      description: { en: 'Smashed avocado with lemon and seeds on toast', jp: 'レモンとシードをのせたアボカドトーストサンド' },
      category: 'sandwich', itemType: 'snack', isVegetarian: true, basePrice: 7.50,
      tags: ['sandwich', 'avocado', 'healthy', 'trendy'],
    },
    // ── TOAST & PASTRY ──────────────────────────────────────────────────────
    {
      name: { en: 'French Toast', jp: 'フレンチトースト' },
      description: { en: 'Fluffy French toast with maple syrup and berry compote', jp: 'メープルシロップとベリーコンポート添えふわふわフレンチトースト' },
      category: 'toast', itemType: 'snack', isVegetarian: true, basePrice: 7.00,
      tags: ['toast', 'breakfast', 'sweet', 'maple'],
    },
    {
      name: { en: 'Butter Croissant', jp: 'バタークロワッサン' },
      description: { en: 'Flaky butter croissant baked fresh daily', jp: '毎日焼き立てのサクサクバタークロワッサン' },
      category: 'pastry', itemType: 'snack', isVegetarian: true, basePrice: 3.50,
      tags: ['pastry', 'croissant', 'french', 'baked'],
    },
    {
      name: { en: 'Almond Croissant', jp: 'アーモンドクロワッサン' },
      description: { en: 'Buttery croissant filled with almond frangipane', jp: 'アーモンドフランジパーヌ入りのバタークロワッサン' },
      category: 'pastry', itemType: 'snack', isVegetarian: true, basePrice: 4.25,
      tags: ['pastry', 'croissant', 'almond', 'premium'],
    },
    // ── CAKES & COOKIES ─────────────────────────────────────────────────────
    {
      name: { en: 'Matcha Cake', jp: '抹茶ケーキ' },
      description: { en: 'Soft matcha sponge with whipped cream and red bean', jp: 'ホイップクリームと小豆入りのやわらかい抹茶スポンジケーキ' },
      category: 'cake', itemType: 'snack', isVegetarian: true, basePrice: 5.50,
      tags: ['cake', 'matcha', 'japanese', 'red-bean', 'specialty'],
    },
    {
      name: { en: 'Sakura Cheesecake', jp: '桜チーズケーキ' },
      description: { en: 'Cherry blossom flavored Japanese-style cheesecake', jp: '桜フレーバーの日本式チーズケーキ' },
      category: 'cake', itemType: 'snack', isVegetarian: true, basePrice: 6.00, isSeasonal: true,
      seasonalPeriod: { startMonth: 3, endMonth: 5, label: { en: 'Spring 🌸', jp: '春 🌸' } },
      tags: ['cake', 'sakura', 'cheesecake', 'japanese', 'seasonal'],
    },
    {
      name: { en: 'Chocolate Lava Cake', jp: 'チョコレートフォンダン' },
      description: { en: 'Warm chocolate cake with molten center', jp: 'とろとろチョコレートのウォームケーキ' },
      category: 'cake', itemType: 'snack', isVegetarian: true, basePrice: 6.50,
      tags: ['cake', 'chocolate', 'warm', 'indulgent', 'dessert'],
    },
    {
      name: { en: 'Matcha Cookies', jp: '抹茶クッキー' },
      description: { en: 'Crispy matcha cookies with white chocolate chips', jp: 'ホワイトチョコチップ入りサクサク抹茶クッキー' },
      category: 'cookie', itemType: 'snack', isVegetarian: true, basePrice: 2.50,
      tags: ['cookie', 'matcha', 'japanese', 'crispy'],
    },
    {
      name: { en: 'Sesame Cookies', jp: 'ごまクッキー' },
      description: { en: 'Nutty black sesame cookies inspired by Japanese wagashi', jp: '和菓子にインスパイアされた黒ごまクッキー' },
      category: 'cookie', itemType: 'snack', isVegetarian: true, basePrice: 2.50,
      tags: ['cookie', 'sesame', 'japanese', 'nutty'],
    },
    // ── JAPANESE SNACKS ─────────────────────────────────────────────────────
    {
      name: { en: 'Dorayaki', jp: 'どら焼き' },
      description: { en: 'Two fluffy pancakes filled with sweet red bean paste', jp: 'あんこ入りのふわふわどら焼き' },
      category: 'japanese_snack', itemType: 'snack', isVegetarian: true, basePrice: 3.75,
      tags: ['japanese', 'dorayaki', 'red-bean', 'traditional', 'sweet'],
    },
    {
      name: { en: 'Dango', jp: 'だんご' },
      description: { en: 'Grilled rice dumplings on skewer with sweet soy glaze', jp: '甘い醤油ダレをつけた焼きだんご串' },
      category: 'japanese_snack', itemType: 'snack', isVegetarian: true, basePrice: 3.50,
      tags: ['japanese', 'dango', 'mochi', 'grilled', 'traditional'],
    },
    {
      name: { en: 'Sakura Mochi', jp: '桜餅' },
      description: { en: 'Pink mochi rice cake with red bean, wrapped in cherry leaf', jp: '桜の葉で包んだあんこ入りピンク色の桜餅' },
      category: 'japanese_snack', itemType: 'snack', isVegetarian: true, basePrice: 4.00, isSeasonal: true,
      seasonalPeriod: { startMonth: 3, endMonth: 5, label: { en: 'Spring 🌸', jp: '春 🌸' } },
      tags: ['japanese', 'mochi', 'sakura', 'seasonal', 'wagashi'],
    },
  ];
};

// ─── SEED FUNCTION ───────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌸 Starting Sakura Brew Café Database Seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Addon.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed addons
    const createdAddons = await Addon.insertMany(addonsData);
    console.log(`✅ Seeded ${createdAddons.length} add-ons`);

    const addonIds = createdAddons.map((a) => a._id);

    // Seed menu items
    const menuItemsData = buildMenuItems(addonIds);
    const createdMenuItems = await MenuItem.insertMany(menuItemsData);
    console.log(`✅ Seeded ${createdMenuItems.length} menu items`);

    // Seed admin user
    const admin = await User.create({
      name: 'Sakura Admin',
      email: process.env.ADMIN_EMAIL || 'admin@sakurabrew.cafe',
      password: process.env.ADMIN_PASSWORD || 'Admin@Sakura123',
      role: 'admin',
      preferences: { language: 'jp', theme: 'light' },
    });
    console.log(`✅ Created admin: ${admin.email}`);

    // Seed sample customer
    const customer = await User.create({
      name: 'Hana Tanaka',
      email: 'hana@example.com',
      password: 'Customer@123',
      role: 'customer',
      preferences: { language: 'jp', theme: 'dark' },
    });
    console.log(`✅ Created sample customer: ${customer.email}`);

    console.log('\n🌸 ==========================================');
    console.log('   Sakura Brew Café - Seed Complete! 🌸');
    console.log('==========================================');
    console.log(`📦 Menu Items : ${createdMenuItems.length}`);
    console.log(`🧋 Add-ons   : ${createdAddons.length}`);
    console.log(`👤 Users      : 2`);
    console.log('==========================================');
    console.log('🔑 Admin Login:');
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Password : ${process.env.ADMIN_PASSWORD || 'Admin@Sakura123'}`);
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
