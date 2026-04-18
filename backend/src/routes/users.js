const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

/* GET /api/users — admin gets all; ?role=agent filter */
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role
      ? `SELECT u.id, u.name, u.email, u.role, u.created_at,
               COUNT(f.id)::int AS field_count
           FROM users u
           LEFT JOIN fields f ON f.assigned_agent_id = u.id
           WHERE u.role = $1
           GROUP BY u.id ORDER BY u.name`
      : `SELECT u.id, u.name, u.email, u.role, u.created_at,
               COUNT(f.id)::int AS field_count
           FROM users u
           LEFT JOIN fields f ON f.assigned_agent_id = u.id
           GROUP BY u.id ORDER BY u.role, u.name`;

    const { rows } = role
      ? await pool.query(query, [role])
      : await pool.query(query);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* POST /api/users — admin creates an agent */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, email, password, role = 'agent' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }
  if (!['admin', 'agent'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email.toLowerCase().trim(), hash, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email already in use' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
