const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000', credentials: true }));
app.use(express.json());

/* Routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/updates', require('./routes/updates'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

/* Health check */
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

/* 404 */
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

/* Error handler */
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
