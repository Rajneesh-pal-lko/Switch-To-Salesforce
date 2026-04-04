/**
 * Optional: if STS_API_ORIGIN is set in the environment, overwrite window.STS_API_ORIGIN in js/config.js.
 * If unset, exits without changing js/config.js (keeps runtime logic in config.js — works on Vercel without dashboard env).
 *
 * Example: STS_API_ORIGIN=https://your-api.onrender.com npm run build
 */
const fs = require('fs');
const path = require('path');

const origin = (process.env.STS_API_ORIGIN || '').trim().replace(/\/$/, '');
if (!origin) {
  console.log('config.js: STS_API_ORIGIN unset — leaving js/config.js unchanged (Vercel uses hostname detection).');
  process.exit(0);
}

const outPath = path.join(__dirname, '..', 'js', 'config.js');
const body = `/* Generated at deploy — ${new Date().toISOString()} — STS_API_ORIGIN from CI */
window.STS_API_ORIGIN = ${JSON.stringify(origin)};
`;

fs.writeFileSync(outPath, body, 'utf8');
console.log('config.js: wrote STS_API_ORIGIN from env:', origin);
