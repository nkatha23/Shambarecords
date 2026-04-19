const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

/* Security headers */
app.use(helmet({
  crossOriginResourcePolicy: { policy: isProd ? 'same-origin' : 'cross-origin' },
}));

/* Gzip compression */
app.use(compression());

/* CORS — dev: allow Vite dev server; prod: same-origin (served statically) */
if (!isProd) {
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  }));
}

app.use(express.json());

/* Global rate limiter — 200 req / 15 min per IP */
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
}));

/* Stricter limiter for auth endpoints — 20 req / 15 min */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});

/* API Routes */
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/updates', require('./routes/updates'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

/* Health check */
app.get('/api/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV ?? 'development' }));

/* Serve built frontend in production */
if (isProd) {
  const staticPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(staticPath));
  app.get('*', (_, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

/* 404 (dev only — prod falls through to the SPA catch-all above) */
if (!isProd) {
  app.use((_, res) => res.status(404).json({ message: 'Not found' }));
}

/* Error handler */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: isProd ? 'Internal server error' : err.message });
});

module.exports = app;
