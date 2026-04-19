require('dotenv').config();

/* Validate required environment variables before anything else */
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT ?? 5000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected.');
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
    });
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
}

start();
