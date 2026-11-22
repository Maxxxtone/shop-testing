const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

// GET /api/cart — своя корзина
router.get('/', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ci.id, ci.quantity,
            p.id AS product_id, p.title, p.price, p.stock,
            (ci.quantity * p.price)::numeric AS subtotal
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.id`,
    [req.user.sub]
  );
  const total = rows.reduce((s, r) => s + Number(r.subtotal), 0);
  res.json({ items: rows, total: Number(total.toFixed(2)) });
});

// POST /api/cart { product_id, quantity } — добавить
router.post('/', authRequired, async (req, res) => {
  const { product_id, quantity = 1 } = req.body || {};
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  const prod = await pool.query('SELECT stock FROM products WHERE id=$1 AND is_active=TRUE', [product_id]);
  if (!prod.rows[0]) return res.status(404).json({ error: 'Product not found' });
  if (prod.rows[0].stock < quantity) return res.status(400).json({ error: 'Not enough stock' });

  const { rows } = await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1,$2,$3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [req.user.sub, product_id, quantity]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/cart/:id { quantity } — изменить количество
router.put('/:id', authRequired, async (req, res) => {
  const { quantity } = req.body || {};
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be >= 1' });

  const { rows } = await pool.query(
    `UPDATE cart_items SET quantity=$1
     WHERE id=$2 AND user_id=$3 RETURNING *`,
    [quantity, Number(req.params.id), req.user.sub]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Cart item not found' });
  res.json(rows[0]);
});

// DELETE /api/cart/:id
router.delete('/:id', authRequired, async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM cart_items WHERE id=$1 AND user_id=$2',
    [Number(req.params.id), req.user.sub]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'Cart item not found' });
  res.status(204).send();
});

module.exports = router;