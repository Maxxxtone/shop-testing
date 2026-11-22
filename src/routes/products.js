const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');
const { adminRequired } = require('../middleware/admin');
const router = express.Router();

// GET /api/products?q=ноут&category=electronics&min_price=10000&max_price=80000&sort=price_asc&page=1&limit=10
router.get('/', async (req, res) => {
  const {
    q, category, min_price, max_price,
    sort = 'id_asc', page = 1, limit = 20,
  } = req.query;

  const where = ['is_active = TRUE'];
  const params = [];

  // Поиск по имени (частичный, регистронезависимый)
  if (q) {
    params.push(`%${q}%`);
    where.push(`LOWER(title) LIKE LOWER($${params.length})`);
  }

  // Фильтр по категории (slug)
  if (category) {
    params.push(category);
    where.push(`category_id = (SELECT id FROM categories WHERE slug = $${params.length})`);
  }

  // Диапазон цен
  if (min_price) {
    params.push(Number(min_price));
    where.push(`price >= $${params.length}`);
  }
  if (max_price) {
    params.push(Number(max_price));
    where.push(`price <= $${params.length}`);
  }

  // Сортировка (whitelist — защита от SQL-инъекции)
  const sortMap = {
    id_asc: 'id ASC',
    id_desc: 'id DESC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    title_asc: 'title ASC',
    title_desc: 'title DESC',
    created_desc: 'created_at DESC',
  };
  const orderBy = sortMap[sort] || 'id ASC';

  // Пагинация
  const lim = Math.min(Number(limit) || 20, 100);
  const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
  params.push(lim, off);

  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${where.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const { rows } = await pool.query(sql, params);
  res.json({ items: rows, page: Number(page) || 1, limit: lim, count: rows.length });
});

// GET /api/products/search?name=ноут — упрощённый поиск только по имени
router.get('/search', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name query param is required' });

  const { rows } = await pool.query(
    `SELECT id, title, price, stock
     FROM products
     WHERE is_active = TRUE AND LOWER(title) LIKE LOWER($1)
     ORDER BY title ASC`,
    [`%${name}%`]
  );
  res.json({ query: name, count: rows.length, items: rows });
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be integer' });

  const { rows } = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
});

// POST /api/products — только админ
router.post('/', authRequired, adminRequired, async (req, res) => {
  const { title, description, price, stock, category_id, sku } = req.body || {};
  if (!title || price == null) {
    return res.status(400).json({ error: 'title and price are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (title, description, price, stock, category_id, sku)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description || null, price, stock || 0, category_id || null, sku || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'SKU already exists' });
    throw e;
  }
});

// PUT /api/products/:id — только админ
router.put('/:id', authRequired, adminRequired, async (req, res) => {
  const { title, description, price, stock, category_id, is_active } = req.body || {};
  const { rows } = await pool.query(
    `UPDATE products SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       price = COALESCE($3, price),
       stock = COALESCE($4, stock),
       category_id = COALESCE($5, category_id),
       is_active = COALESCE($6, is_active),
       updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [title, description, price, stock, category_id, is_active, Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
});

// DELETE /api/products/:id — только админ
router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM products WHERE id = $1',
    [Number(req.params.id)]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'Product not found' });
  res.status(204).send();
});

module.exports = router;