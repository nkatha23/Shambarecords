const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

/* GET /api/updates/:fieldId — all updates for a field */
router.get('/:fieldId', verifyToken, async (req, res) => {
  try {
    /* agents can only view their own fields */
    if (req.user.role === 'agent') {
      const { rows: check } = await pool.query(
        'SELECT id FROM fields WHERE id = $1 AND assigned_agent_id = $2',
        [req.params.fieldId, req.user.id]
      );
      if (!check.length) return res.status(403).json({ message: 'Forbidden' });
    }

    const { rows } = await pool.query(`
      SELECT fu.*, u.name AS agent_name
      FROM field_updates fu
      LEFT JOIN users u ON u.id = fu.agent_id
      WHERE fu.field_id = $1
      ORDER BY fu.created_at DESC
    `, [req.params.fieldId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* POST /api/updates/:fieldId — agent posts an update */
router.post('/:fieldId', verifyToken, async (req, res) => {
  const { stage, notes } = req.body;
  if (!stage || !notes?.trim()) {
    return res.status(400).json({ message: 'stage and notes are required' });
  }

  try {
    /* Agents can only update their assigned fields */
    if (req.user.role === 'agent') {
      const { rows: check } = await pool.query(
        'SELECT id FROM fields WHERE id = $1 AND assigned_agent_id = $2',
        [req.params.fieldId, req.user.id]
      );
      if (!check.length) return res.status(403).json({ message: 'Forbidden: not your field' });
    }

    /* Insert update record */
    const { rows } = await pool.query(`
      INSERT INTO field_updates (field_id, agent_id, new_stage, notes)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [req.params.fieldId, req.user.id, stage, notes.trim()]);

    /* Advance field stage */
    await pool.query(
      'UPDATE fields SET current_stage = $1 WHERE id = $2',
      [stage, req.params.fieldId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
