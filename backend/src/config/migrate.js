require('dotenv').config();
const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(120) NOT NULL,
        email       VARCHAR(200) NOT NULL UNIQUE,
        password    VARCHAR(200) NOT NULL,
        role        VARCHAR(20)  NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS fields (
        id                SERIAL PRIMARY KEY,
        name              VARCHAR(120) NOT NULL,
        crop_type         VARCHAR(100) NOT NULL,
        planting_date     DATE         NOT NULL,
        current_stage     VARCHAR(20)  NOT NULL DEFAULT 'planted'
                            CHECK (current_stage IN ('planted', 'growing', 'ready', 'harvested')),
        notes             TEXT,
        assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS field_updates (
        id          SERIAL PRIMARY KEY,
        field_id    INTEGER      NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        agent_id    INTEGER      REFERENCES users(id) ON DELETE SET NULL,
        new_stage   VARCHAR(20)  NOT NULL
                      CHECK (new_stage IN ('planted', 'growing', 'ready', 'harvested')),
        notes       TEXT,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* Trigger: auto-update fields.updated_at on row change */
    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS trg_fields_updated_at ON fields;
      CREATE TRIGGER trg_fields_updated_at
        BEFORE UPDATE ON fields
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);

    await client.query('COMMIT');
    console.log('Migration complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed — full error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
