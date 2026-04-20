const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // required on Render — sits behind a proxy
const isProd = process.env.NODE_ENV === 'production';

/* Security headers */
app.use(helmet());

/* Gzip compression */
app.use(compression());

/* CORS — strip any accidental trailing slash so the header matches the browser Origin exactly */
const allowedOrigin = (process.env.CLIENT_ORIGIN ?? 'http://localhost:3000').replace(/\/$/, '');
app.use(cors({ origin: allowedOrigin, credentials: true }));

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

/* 404 */
app.use((_, res) => res.status(404).json({ message: 'Not found' }));

/* Error handler */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: isProd ? 'Internal server error' : err.message });
});

module.exports = app;
