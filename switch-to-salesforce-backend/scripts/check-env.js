#!/usr/bin/env node
/**
 * Validates configuration from `.env` without starting the server or connecting to MongoDB.
 * Run: npm run config:check
 */
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

function line(label, ok, detail) {
  var mark = ok ? '[ok]' : '[!]';
  console.log(mark + ' ' + label + (detail ? ' — ' + detail : ''));
}

console.log('');
console.log('Switch To Salesforce — backend configuration check');
console.log('==================================================');
console.log('');

if (!fs.existsSync(envPath)) {
  console.log('[!] No .env file found at: ' + envPath);
  console.log('    Copy .env.example:  cp .env.example .env');
  console.log('    Then edit .env and run this command again.');
  process.exit(1);
}

line('.env file exists', true, envPath);

// Loads the same module the server uses
const env = require('../config/env');

line('PORT', true, String(env.port));
line('NODE_ENV', true, env.nodeEnv);
line('FRONTEND_URL (CORS)', env.frontendUrls.length > 0, env.frontendUrls.join(', ') || '(empty)');
line('SITE_URL', !!env.siteUrl, env.siteUrl || '(optional; used for sitemap/SEO)');

if (env.jwtSecret && env.jwtSecret.length >= 16) {
  line('JWT_SECRET', true, 'set (' + env.jwtSecret.length + ' chars)');
} else if (env.jwtSecret) {
  line('JWT_SECRET', false, 'too short — use at least 16 characters in production');
} else {
  line('JWT_SECRET', false, 'missing — required for login / admin routes');
}

line('JWT_EXPIRES_IN', true, env.jwtExpiresIn);

if (env.mongodbUri) {
  line('MONGODB_URI', true, 'set (database connection string present)');
} else {
  line('MONGODB_URI', false, 'not set — add when you are ready to connect the database');
}

console.log('');
console.log('Next steps');
console.log('----------');
if (!env.jwtSecret || env.jwtSecret.length < 16) {
  console.log('- Set a strong JWT_SECRET in .env');
}
if (!env.mongodbUri) {
  console.log('- When ready: set MONGODB_URI (local MongoDB or Atlas), then npm run dev');
} else {
  console.log('- Start API: npm run dev');
}
console.log('');
process.exit(0);
