const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT c.*, COUNT(p.id)::int AS products_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.name
  `);
  res.json(rows);
});

module.exports = router;