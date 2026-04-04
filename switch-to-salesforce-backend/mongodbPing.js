/**
 * MongoDB Atlas connectivity check (Node.js driver)
 *
 * Why this script: confirms your Atlas URI, network allowlist, and DB user
 * work before you rely on them in the main app—failures here are easier to debug.
 *
 * First-time install (gets the `mongodb` driver this script uses):
 *   cd switch-to-salesforce-backend && npm install
 *
 * Run the check (same folder; put MONGODB_URI in `.env` or see resolveUri() for file fallbacks):
 *   cd switch-to-salesforce-backend && node mongodbPing.js
 *
 * Do not commit real URIs; use .env (gitignored) or a local file you keep private.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Load `.env` from this script’s directory so running `node mongodbPing.js` behaves like the rest of the backend.
dotenv.config({ path: path.join(__dirname, '.env') });

const CONFIG_JSON = path.join(__dirname, 'mongodb-ping.config.json');
const URI_LINE_FILE = path.join(__dirname, 'mongodb.uri');

/**
 * Resolve the connection string: env wins, then optional files (for beginners who prefer not to export vars in the shell).
 */
function resolveUri() {
  const fromEnv = process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim();
  if (fromEnv) {
    console.log('[1/5] Using MONGODB_URI from the environment (after loading .env if present).');
    return fromEnv;
  }

  if (fs.existsSync(CONFIG_JSON)) {
    console.log('[1/5] MONGODB_URI not set; trying mongodb-ping.config.json next to this script.');
    const raw = fs.readFileSync(CONFIG_JSON, 'utf8');
    const parsed = JSON.parse(raw);
    const uri = parsed && (parsed.MONGODB_URI || parsed.mongodbUri);
    if (uri && String(uri).trim()) {
      return String(uri).trim();
    }
    throw new Error('mongodb-ping.config.json exists but has no MONGODB_URI or mongodbUri string.');
  }

  if (fs.existsSync(URI_LINE_FILE)) {
    console.log('[1/5] Using single-line URI file mongodb.uri (no secrets in source control, please).');
    return fs.readFileSync(URI_LINE_FILE, 'utf8').trim();
  }

  throw new Error(
    'No connection string found. Set MONGODB_URI in .env, or create mongodb-ping.config.json with {"MONGODB_URI":"..."}, or put the URI in a one-line mongodb.uri file next to this script.'
  );
}

async function main() {
  console.log('[0/5] MongoDB Atlas ping — starting.\n');

  let uri;
  try {
    uri = resolveUri();
  } catch (e) {
    console.error('✗', e.message || e);
    console.error('\nSet MONGODB_URI in .env, or add mongodb-ping.config.json / mongodb.uri next to this file.\n');
    process.exit(1);
  }

  // Atlas lives in the cloud; a host like 127.0.0.1 means a local mongod — won’t reach Atlas no matter how long we wait.
  const looksLocal =
    /(^|@)(127\.0\.0\.1|localhost)(:|\/)/i.test(uri) || /mongodb:\/\/127\.0\.0\.1|mongodb:\/\/localhost/i.test(uri);
  if (looksLocal) {
    console.error('✗ MONGODB_URI points at this machine (localhost / 127.0.0.1), not MongoDB Atlas.');
    console.error('  In Atlas → Connect → Drivers, copy the mongodb+srv://… URI into .env as MONGODB_URI.');
    console.error('  Atlas → Network Access: allow your IP (or 0.0.0.0/0 for testing).\n');
    process.exit(1);
  }

  // Server API version 1 — stable for connect + ping; avoids guessing cluster topology details.
  const client = new MongoClient(uri, { serverApi: { version: '1', strict: true, deprecationErrors: true } });

  try {
    console.log('[2/5] Connecting to Atlas (DNS + TLS handshake; IP must be allowlisted in Atlas)…');
    await client.connect();

    // { ping: 1 } is cheap: round-trips to the primary without listing collections—enough to prove the deployment answers.
    console.log('[3/5] Sending admin ping command…');
    const pingResult = await client.db('admin').command({ ping: 1 });
    if (!pingResult || pingResult.ok !== 1) {
      throw new Error('Ping returned unexpected result: ' + JSON.stringify(pingResult));
    }

    console.log('[4/5] Success: Atlas responded to ping (ok=1).');
    console.log('\n✓ MongoDB Atlas connectivity check passed.\n');
  } catch (err) {
    console.error('\n✗ MongoDB Atlas check failed.\n');
    if (err && err.message) {
      console.error('Reason:', err.message);
    }
    if (err && err.code) {
      console.error('Code:', err.code);
    }
    console.error('\nHints: verify MONGODB_URI, database user password, Atlas Network Access (IP allowlist), and that the URI uses mongodb+srv for Atlas.\n');
    process.exitCode = 1;
  } finally {
    console.log('[5/5] Closing connection…');
    await client.close().catch(() => {
      /* ignore close errors after a failed connect */
    });
    console.log('Done.');
  }
}

main();
