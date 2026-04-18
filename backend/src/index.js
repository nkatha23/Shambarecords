require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT ?? 5000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected.');
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
}

start();
