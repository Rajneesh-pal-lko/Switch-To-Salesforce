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

const frontendUrls = parseFrontendUrls();

/**
 * Allow https://*.vercel.app (preview URLs) in CORS when:
 * - CORS_ALLOW_VERCEL=true|1, or
 * - FRONTEND_URL lists any *.vercel.app origin (typical: production on Vercel) and CORS_ALLOW_VERCEL is not false|0.
 * Set CORS_ALLOW_VERCEL=false to allow only exact FRONTEND_URL origins plus localhost.
 */
const corsFlag = (process.env.CORS_ALLOW_VERCEL || '').trim().toLowerCase();
const corsAllowVercel =
  corsFlag === 'true' ||
  corsFlag === '1' ||
  (corsFlag !== 'false' &&
    corsFlag !== '0' &&
    frontendUrls.some((u) => /\.vercel\.app$/i.test(u)));

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
  frontendUrls,
  corsAllowVercel,
  siteUrl: (process.env.SITE_URL || '').trim(),
};
