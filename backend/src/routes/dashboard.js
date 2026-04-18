const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { computeStatus } = require('../models/fieldStatus');

router.get('/', verifyToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    /* Fetch fields (role-scoped) */
    const fieldQuery = isAdmin
      ? `SELECT f.*,
           COALESCE(
             (SELECT fu.created_at FROM field_updates fu WHERE fu.field_id = f.id ORDER BY fu.created_at DESC LIMIT 1),
             f.updated_at
           ) AS last_updated_at
         FROM fields f ORDER BY f.created_at DESC`
      : `SELECT f.*,
           COALESCE(
             (SELECT fu.created_at FROM field_updates fu WHERE fu.field_id = f.id ORDER BY fu.created_at DESC LIMIT 1),
             f.updated_at
           ) AS last_updated_at
         FROM fields f WHERE f.assigned_agent_id = $1 ORDER BY f.created_at DESC`;

    const { rows: fields } = isAdmin
      ? await pool.query(fieldQuery)
      : await pool.query(fieldQuery, [req.user.id]);

    /* Attach computed status */
    const withStatus = fields.map((f) => ({ ...f, status: computeStatus(f) }));

    /* Status breakdown */
    const statusBreakdown = { active: 0, at_risk: 0, completed: 0 };
    const stageBreakdown = { planted: 0, growing: 0, ready: 0, harvested: 0 };
    const atRiskFields = [];

    for (const f of withStatus) {
      statusBreakdown[f.status] = (statusBreakdown[f.status] ?? 0) + 1;
      stageBreakdown[f.current_stage] = (stageBreakdown[f.current_stage] ?? 0) + 1;
      if (f.status === 'at_risk') atRiskFields.push({ id: f.id, name: f.name, crop_type: f.crop_type });
    }

    /* Recent updates (last 10) */
    const updateQuery = isAdmin
      ? `SELECT fu.*, f.name AS field_name, u.name AS agent_name
           FROM field_updates fu
           JOIN fields f ON f.id = fu.field_id
           LEFT JOIN users u ON u.id = fu.agent_id
           ORDER BY fu.created_at DESC LIMIT 10`
      : `SELECT fu.*, f.name AS field_name, u.name AS agent_name
           FROM field_updates fu
           JOIN fields f ON f.id = fu.field_id AND f.assigned_agent_id = $1
           LEFT JOIN users u ON u.id = fu.agent_id
           ORDER BY fu.created_at DESC LIMIT 10`;

    const { rows: recentUpdates } = isAdmin
      ? await pool.query(updateQuery)
      : await pool.query(updateQuery, [req.user.id]);

    /* Agent count (admin only) */
    let agentCount = undefined;
    if (isAdmin) {
      const { rows } = await pool.query(`SELECT COUNT(*)::int AS cnt FROM users WHERE role = 'agent'`);
      agentCount = rows[0].cnt;
    }

    res.json({
      totalFields: withStatus.length,
      statusBreakdown,
      stageBreakdown,
      atRiskFields,
      recentUpdates,
      ...(isAdmin && { agentCount }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
