# Backend configuration (no database required for this step)

Use this when you want the **API project configured** (environment variables, file layout) **before** you provision MongoDB or run the server with a live database.

## 1. Create `.env`

From `switch-to-salesforce-backend/`:

```bash
cp .env.example .env
```

Edit `.env` in your editor. Nothing here talks to the database until you add `MONGODB_URI`.

## 2. Variables explained

| Variable | Required to run API | Purpose |
|----------|----------------------|---------|
| `PORT` | No (defaults `5000`) | HTTP port for Express |
| `NODE_ENV` | No (`development` / `production`) | Security headers, rate limits, error detail |
| `JWT_SECRET` | **Yes** for admin login | Signs JWTs — use a long random string (16+ chars minimum in production) |
| `JWT_EXPIRES_IN` | No (default `7d`) | Token lifetime |
| `FRONTEND_URL` | Recommended | Browser origin(s) allowed by CORS — comma-separated if you have several |
| `SITE_URL` | Optional | Public base URL of **this API** (sitemap, SEO helpers) |
| `MONGODB_URI` | **Yes** to start the server | MongoDB connection string — **add when you connect the DB** |

Central parsing lives in [`config/env.js`](./config/env.js).

## 3. Run everything (copy `.env`, install, check)

From `switch-to-salesforce-backend/`:

```bash
npm run try:all
```

Same as: copy `.env` if missing, `npm install`, `npm run config:check`.

## 4. Check configuration only (no install)

This only reads `.env` and prints what is set or missing — **no database connection**:

```bash
cd switch-to-salesforce-backend
npm install
npm run config:check
```

Fix any `[!]` lines in the output, then continue.

## 5. When you add the database later

1. Set `MONGODB_URI` in `.env` (local or [Atlas](https://www.mongodb.com/cloud/atlas)).
2. Run `npm run dev` — the server connects on startup.
3. Run `npm run seed` once to create the admin user (see [README.md](./README.md)).

## 6. Files involved

| File | Role |
|------|------|
| `.env` | Your secrets (not committed) |
| `.env.example` | Template checked into git |
| `config/env.js` | Loads `.env` and exports settings |
| `config/db.js` | Mongoose connection (uses `MONGODB_URI`) |
| `server.js` | Express app, CORS, routes |
