require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const categories = [
  { name: 'Электроника', slug: 'electronics' },
  { name: 'Аксессуары', slug: 'accessories' },
  { name: 'Периферия', slug: 'peripherals' },
  { name: 'Аудио', slug: 'audio' },
  { name: 'Умный дом', slug: 'smart-home' },
];

const products = [
  // Электроника
  { title: 'Ноутбук Lenovo IdeaPad 3', description: '15.6", Ryzen 5, 16GB RAM, 512GB SSD', price: 64990, stock: 15, category: 'electronics', sku: 'LEN-IP3-001' },
  { title: 'Ноутбук HP Pavilion 15', description: '15.6", Intel i5, 8GB RAM, 256GB SSD', price: 58990, stock: 8, category: 'electronics', sku: 'HP-PAV-002' },
  { title: 'Ноутбук ASUS VivoBook', description: '14", Intel i7, 16GB RAM, 1TB SSD', price: 89990, stock: 5, category: 'electronics', sku: 'ASU-VB-003' },
  { title: 'Смартфон Samsung Galaxy A54', description: '6.4", 128GB, 8GB RAM', price: 29990, stock: 25, category: 'electronics', sku: 'SAM-A54-004' },
  { title: 'Смартфон Xiaomi Redmi Note 12', description: '6.67", 128GB, 6GB RAM', price: 19990, stock: 40, category: 'electronics', sku: 'XIA-RN12-005' },
  { title: 'Планшет iPad 10', description: '10.9", 64GB, Wi-Fi', price: 44990, stock: 12, category: 'electronics', sku: 'APL-IP10-006' },

  // Аксессуары
  { title: 'Чехол для iPhone 15', description: 'Силиконовый, прозрачный', price: 1500, stock: 100, category: 'accessories', sku: 'ACC-IP15-007' },
  { title: 'Зарядное устройство USB-C 65W', description: 'Быстрая зарядка, GaN', price: 2990, stock: 60, category: 'accessories', sku: 'ACC-USBC-008' },
  { title: 'Кабель USB-C — USB-C 2м', description: 'Нейлоновая оплётка, 100W', price: 890, stock: 150, category: 'accessories', sku: 'ACC-CAB-009' },
  { title: 'Powerbank 20000mAh', description: 'Быстрая зарядка 22.5W', price: 3490, stock: 35, category: 'accessories', sku: 'ACC-PB-010' },

  // Периферия
  { title: 'Мышь Logitech MX Master 3', description: 'Беспроводная, эргономичная', price: 7990, stock: 20, category: 'peripherals', sku: 'LOG-MX3-011' },
  { title: 'Мышь беспроводная Logitech M185', description: 'Компактная, 2.4 ГГц', price: 1290, stock: 80, category: 'peripherals', sku: 'LOG-M185-012' },
  { title: 'Клавиатура механическая Keychron K2', description: 'Компактная, RGB, hot-swap', price: 9990, stock: 18, category: 'peripherals', sku: 'KEY-K2-013' },
  { title: 'Клавиатура Logitech K380', description: 'Беспроводная, мультиустройство', price: 3490, stock: 45, category: 'peripherals', sku: 'LOG-K380-014' },
  { title: 'Монитор Dell UltraSharp 27"', description: '4K, IPS, USB-C', price: 54990, stock: 7, category: 'peripherals', sku: 'DEL-U27-015' },
  { title: 'Монитор LG 24" Full HD', description: 'IPS, 75Hz', price: 14990, stock: 22, category: 'peripherals', sku: 'LG-24-016' },
  { title: 'Веб-камера Logitech C920', description: 'Full HD 1080p', price: 6990, stock: 30, category: 'peripherals', sku: 'LOG-C920-017' },

  // Аудио
  { title: 'Наушники Sony WH-1000XM5', description: 'Беспроводные, шумоподавление', price: 34990, stock: 14, category: 'audio', sku: 'SON-XM5-018' },
  { title: 'Наушники AirPods Pro 2', description: 'TWS, активное шумоподавление', price: 24990, stock: 28, category: 'audio', sku: 'APL-APP2-019' },
  { title: 'Наушники HyperX Cloud II', description: 'Игровые, 7.1, микрофон', price: 8990, stock: 19, category: 'audio', sku: 'HYP-C2-020' },
  { title: 'Колонка JBL Flip 6', description: 'Портативная, Bluetooth, IP67', price: 11990, stock: 33, category: 'audio', sku: 'JBL-F6-021' },
  { title: 'Колонка Marshall Emberton II', description: 'Портативная, 360°', price: 17990, stock: 11, category: 'audio', sku: 'MAR-EMB-022' },
  { title: 'Микрофон HyperX QuadCast', description: 'USB, конденсаторный', price: 14990, stock: 9, category: 'audio', sku: 'HYP-QC-023' },

  // Умный дом
  { title: 'Умная лампа Xiaomi Mi LED', description: 'RGB, Wi-Fi, E27', price: 1990, stock: 70, category: 'smart-home', sku: 'XIA-LED-024' },
  { title: 'Умная розетка TP-Link Tapo P100', description: 'Wi-Fi, 16A', price: 1490, stock: 90, category: 'smart-home', sku: 'TPL-P100-025' },
  { title: 'Робот-пылесос Roborock S7', description: 'Лидар, влажная уборка', price: 44990, stock: 6, category: 'smart-home', sku: 'ROB-S7-026' },
  { title: 'Умный замок Aqara N100', description: 'Отпечаток пальца, Bluetooth', price: 14990, stock: 13, category: 'smart-home', sku: 'AQ-N100-027' },
  { title: 'Датчик протечки Aqara', description: 'Zigbee, уведомления', price: 2490, stock: 55, category: 'smart-home', sku: 'AQ-LEAK-028' },
  { title: 'Умный чайник Xiaomi Mi Kettle', description: 'Bluetooth, 1.5л', price: 3490, stock: 24, category: 'smart-home', sku: 'XIA-KET-029' },
  { title: 'Умный термостат Nest', description: 'Программируемый, Wi-Fi', price: 19990, stock: 8, category: 'smart-home', sku: 'NES-TH-030' },
];

const users = [
  { email: 'admin@shop.local', password: 'admin123', full_name: 'Администратор Магазина', role: 'admin' },
  { email: 'alice@test.com', password: 'alice123', full_name: 'Алиса Иванова', role: 'customer' },
  { email: 'bob@test.com', password: 'bob123', full_name: 'Боб Смирнов', role: 'customer' },
];

async function main() {
  console.log('Seeding...');

  // Категории
  const categoryIds = {};
  for (const c of categories) {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug) VALUES ($1,$2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, slug`,
      [c.name, c.slug]
    );
    categoryIds[rows[0].slug] = rows[0].id;
  }
  console.log(`  Categories: ${Object.keys(categoryIds).length}`);

  // Товары
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (title, description, price, stock, category_id, sku)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (sku) DO NOTHING`,
      [p.title, p.description, p.price, p.stock, categoryIds[p.category] || null, p.sku]
    );
  }
  console.log(`  Products: ${products.length}`);

  // Пользователи
  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [u.email, hash, u.full_name, u.role]
    );
  }
  console.log(`  Users: ${users.length}`);

  // Демо-корзина для alice
  const aliceRes = await pool.query('SELECT id FROM users WHERE email=$1', ['alice@test.com']);
  const aliceId = aliceRes.rows[0].id;
  const demoProduct = await pool.query(
    "SELECT id FROM products WHERE sku=$1",
    ['LOG-MX3-011']
  );
  if (demoProduct.rows[0]) {
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1,$2,2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [aliceId, demoProduct.rows[0].id]
    );
    console.log('  Demo cart item added for alice');
  }

  console.log('Seed OK');
  console.log('Logins:');
  console.log('  admin@shop.local / admin123  (role: admin)');
  console.log('  alice@test.com   / alice123  (role: customer)');
  console.log('  bob@test.com     / bob123    (role: customer)');

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });