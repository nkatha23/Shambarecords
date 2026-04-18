const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const { computeStatus } = require('../models/fieldStatus');

const BASE_QUERY = `
  SELECT
    f.*,
    u.name  AS agent_name,
    COALESCE(
      (SELECT fu.created_at FROM field_updates fu WHERE fu.field_id = f.id ORDER BY fu.created_at DESC LIMIT 1),
      f.updated_at
    ) AS last_updated_at
  FROM fields f
  LEFT JOIN users u ON u.id = f.assigned_agent_id
`;

function attachStatus(rows) {
  return rows.map((r) => ({ ...r, status: computeStatus(r) }));
}

/* GET /api/fields */
router.get('/', verifyToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin') {
      ({ rows } = await pool.query(`${BASE_QUERY} ORDER BY f.created_at DESC`));
    } else {
      ({ rows } = await pool.query(
        `${BASE_QUERY} WHERE f.assigned_agent_id = $1 ORDER BY f.created_at DESC`,
        [req.user.id]
      ));
    }
    res.json(attachStatus(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* GET /api/fields/:id */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`${BASE_QUERY} WHERE f.id = $1`, [req.params.id]);
    const field = rows[0];
    if (!field) return res.status(404).json({ message: 'Field not found' });

    if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ ...field, status: computeStatus(field) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* POST /api/fields — admin only */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, crop_type, planting_date, current_stage = 'planted', assigned_agent_id, notes } = req.body;
  if (!name || !crop_type || !planting_date) {
    return res.status(400).json({ message: 'name, crop_type and planting_date are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO fields (name, crop_type, planting_date, current_stage, assigned_agent_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, crop_type, planting_date, current_stage, assigned_agent_id || null, notes || null, req.user.id]
    );
    const field = rows[0];

    /* record initial stage as first update */
    await pool.query(
      `INSERT INTO field_updates (field_id, agent_id, new_stage, notes) VALUES ($1, $2, $3, $4)`,
      [field.id, req.user.id, current_stage, notes || 'Field created.']
    );

    res.status(201).json({ ...field, status: computeStatus(field) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* PUT /api/fields/:id — admin only */
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, crop_type, planting_date, current_stage, assigned_agent_id, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE fields
         SET name = COALESCE($1, name),
             crop_type = COALESCE($2, crop_type),
             planting_date = COALESCE($3, planting_date),
             current_stage = COALESCE($4, current_stage),
             assigned_agent_id = $5,
             notes = COALESCE($6, notes)
       WHERE id = $7
       RETURNING *`,
      [name, crop_type, planting_date, current_stage, assigned_agent_id || null, notes, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Field not found' });
    res.json({ ...rows[0], status: computeStatus(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* DELETE /api/fields/:id — admin only */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM fields WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Field not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
