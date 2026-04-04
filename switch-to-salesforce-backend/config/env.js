/**
 * Loads `.env` once and exposes parsed settings for the rest of the app.
 * Database (MONGODB_URI) is optional for `npm run config:check` only — the API still needs it to run.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function parseFrontendUrls() {
  return (process.env.FRONTEND_URL || 'http://localhost:5500')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const port = parseInt(process.env.PORT || '5000', 10);

module.exports = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  get isProduction() {
    return (process.env.NODE_ENV || 'development') === 'production';
  },
  mongodbUri: (process.env.MONGODB_URI || '').trim(),
  jwtSecret: (process.env.JWT_SECRET || '').trim(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrls: parseFrontendUrls(),
  siteUrl: (process.env.SITE_URL || '').trim(),
};
