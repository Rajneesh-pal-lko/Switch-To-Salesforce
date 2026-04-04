/**
 * Loads `.env` once and exposes parsed settings for the rest of the app.
 * Database (MONGODB_URI) is optional for `npm run config:check` only — the API still needs it to run.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function parseFrontendUrls() {
  return (process.env.FRONTEND_URL || 'http://localhost:5500')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/** If true, allow any https://*.vercel.app origin (preview deploys). Use with care. */
const corsAllowVercel =
  process.env.CORS_ALLOW_VERCEL === 'true' || process.env.CORS_ALLOW_VERCEL === '1';

const port = parseInt(process.env.PORT || '5000', 10);

const mongodbUri = (process.env.MONGODB_URI || '').trim();
/** Start HTTP server without connecting MongoDB (local smoke test). Set SKIP_DB=true or leave MONGODB_URI empty. */
const skipDatabase =
  process.env.SKIP_DB === 'true' ||
  process.env.SKIP_DB === '1' ||
  !mongodbUri;

module.exports = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  get isProduction() {
    return (process.env.NODE_ENV || 'development') === 'production';
  },
  mongodbUri,
  skipDatabase,
  jwtSecret: (process.env.JWT_SECRET || '').trim(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrls: parseFrontendUrls(),
  corsAllowVercel,
  siteUrl: (process.env.SITE_URL || '').trim(),
};
