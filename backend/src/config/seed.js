require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const adminHash = await bcrypt.hash('admin123', 10);
    const agentHash = await bcrypt.hash('agent123', 10);
    const agent2Hash = await bcrypt.hash('agent456', 10);

    /* Users */
    const adminRes = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@shamba.io', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
      RETURNING id;
    `, [adminHash]);

    const agent1Res = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Jane Mwangi', 'agent@shamba.io', $1, 'agent')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
      RETURNING id;
    `, [agentHash]);

    const agent2Res = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Brian Otieno', 'agent2@shamba.io', $1, 'agent')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
      RETURNING id;
    `, [agent2Hash]);

    const adminId = adminRes.rows[0].id;
    const agent1Id = agent1Res.rows[0].id;
    const agent2Id = agent2Res.rows[0].id;

    /* Fields */
    const fields = [
      { name: 'Block A — North', crop: 'Maize', date: '2024-10-01', stage: 'growing', agentId: agent1Id },
      { name: 'Block B — South', crop: 'Beans', date: '2024-10-15', stage: 'planted', agentId: agent1Id },
      { name: 'Greenhouse 1', crop: 'Tomatoes', date: '2024-09-01', stage: 'ready', agentId: agent2Id },
      { name: 'Riverside Plot', crop: 'Spinach', date: '2024-08-01', stage: 'harvested', agentId: agent2Id },
      { name: 'Upper Terrace', crop: 'Wheat', date: '2024-07-20', stage: 'growing', agentId: agent1Id },
    ];

    for (const f of fields) {
      const fRes = await client.query(`
        INSERT INTO fields (name, crop_type, planting_date, current_stage, assigned_agent_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `, [f.name, f.crop, f.date, f.stage, f.agentId, adminId]);

      if (fRes.rows.length > 0) {
        const fId = fRes.rows[0].id;
        await client.query(`
          INSERT INTO field_updates (field_id, agent_id, new_stage, notes)
          VALUES ($1, $2, $3, $4)
        `, [fId, f.agentId, f.stage, 'Initial stage recorded.']);
      }
    }

    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
