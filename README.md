# Switch To Salesforce

A production-oriented **full-stack blog platform** with a **static frontend** and a **separate REST API**. The frontend and backend are independent projects: the UI only talks to the backend over HTTP.

**Brand:** *Switch To Salesforce* — documentation-style tutorials and guides for Salesforce developers, admins, and people moving into Salesforce roles (Apex, LWC, Flows, administration, interviews, certifications, career paths).

## Repository layout

| Directory | Role |
|-----------|------|
| [`switch-to-salesforce-frontend/`](./switch-to-salesforce-frontend/) | HTML5, CSS3, vanilla JavaScript — UI only, no database or auth logic in the browser |
| [`switch-to-salesforce-backend/`](./switch-to-salesforce-backend/) | Node.js, Express, MongoDB — JWT admin auth, posts, categories, comments, newsletter |

## Quick start (local)

1. **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Backend** — `.env.example` lives **inside** [`switch-to-salesforce-backend/`](./switch-to-salesforce-backend/) (not the repo root). From the repo root, run:
   ```bash
   cp switch-to-salesforce-backend/.env.example switch-to-salesforce-backend/.env
   cd switch-to-salesforce-backend
   npm install
   npm run config:check
   ```
   Or: `cd switch-to-salesforce-backend` first, then `cp .env.example .env`. See [`switch-to-salesforce-backend/README.md`](./switch-to-salesforce-backend/README.md) and [`switch-to-salesforce-backend/CONFIGURATION.md`](./switch-to-salesforce-backend/CONFIGURATION.md). **One-shot:** from `switch-to-salesforce-backend/`, run `npm run try:all` (creates `.env` if missing, `npm install`, `npm run config:check`). When the DB is ready: `npm run seed`, `npm run dev` (API at `http://localhost:5000/api`).
3. **Frontend** — see [`switch-to-salesforce-frontend/README.md`](./switch-to-salesforce-frontend/README.md): serve the folder over HTTP (e.g. port 5500) and open the site in a browser.

Set `FRONTEND_URL` on the backend to match your static server origin for CORS. The frontend loads `js/config.js` before `api.js`; locally it can stay empty so the API defaults to `http://localhost:5000`.

## Deployment

**Frontend-only:** step-by-step for Vercel, Netlify, and Cloudflare Pages is in [`switch-to-salesforce-frontend/README.md`](./switch-to-salesforce-frontend/README.md#deploy-the-frontend-do-this-first). You can deploy the static site first; add `STS_API_ORIGIN` when the API is live and redeploy.

**Full stack (typical order):** deploy the API so you have a public URL, then point the frontend at it.

### 1. MongoDB Atlas

Create a cluster and a database user. Whitelist `0.0.0.0/0` for testing (tighten to your host IPs later). Copy the **SRV connection string** for `MONGODB_URI`.

### 2. Backend (example: Render)

1. New **Web Service** from this repo, **root directory** `switch-to-salesforce-backend`.
2. **Build:** `npm install` — **Start:** `npm start`.
3. Set environment variables:

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Long random string |
| `FRONTEND_URL` | Your live site, e.g. `https://your-app.vercel.app` (comma-separated if you have more than one origin) |
| `SITE_URL` | Public API base, e.g. `https://switch-to-salesforce-api.onrender.com` |
| `PORT` | Usually set automatically by the host |

4. Run **seed** once locally (or via a one-off job) with the same `MONGODB_URI` to create the admin user — see backend README.
5. Confirm `GET https://<your-api>/health` returns JSON with `"ok": true`.

Optional: [`render.yaml`](./render.yaml) in the repo root can be used as a Render Blueprint; you still add secrets in the dashboard.

### 3. Frontend (example: Vercel or Netlify)

**Vercel**

1. Import the repo; set **Root Directory** to `switch-to-salesforce-frontend`.
2. Add environment variable **`STS_API_ORIGIN`** = your API origin only (no `/api` path), e.g. `https://switch-to-salesforce-api.onrender.com`.
3. **Build command:** `npm run build` — **Install:** `npm install` — **Output:** `.` (current directory). The build runs `scripts/write-api-config.js` and writes `js/config.js` with that URL.
4. Deploy, then open the site and verify the blog loads data.

**Netlify**

Use the repo root [`netlify.toml`](./netlify.toml) (base = `switch-to-salesforce-frontend`). In Netlify **Site settings → Environment variables**, set **`STS_API_ORIGIN`** to the same API origin as above, then trigger a deploy.

**Cloudflare Pages**

Build command: `npm install && npm run build`, root / project directory `switch-to-salesforce-frontend`, output `.`. Add **`STS_API_ORIGIN`** in the project environment.

### 4. CORS

The backend allows origins listed in **`FRONTEND_URL`** (comma-separated) and `localhost` for development. After you get your final frontend URL, set `FRONTEND_URL` on the API to that exact origin (including `https://`, no trailing slash).

### Example (this repo)

| Piece | Value |
|-------|--------|
| Live frontend | `https://switch-to-salesforce.vercel.app` |
| **`FRONTEND_URL` on API** | `https://switch-to-salesforce.vercel.app` (no trailing slash) |
| **`STS_API_ORIGIN` on Vercel** | Your API origin only, e.g. `https://switch-to-salesforce-api.onrender.com` (replace with your real API URL after deploy) |

After the API is live, set **`STS_API_ORIGIN`** on Vercel and **redeploy** the frontend so `js/config.js` is regenerated. Set **`FRONTEND_URL`** on the API host to the Vercel URL above (or add a custom domain when you use one).

## API surface (high level)

- Posts: `GET/POST/PUT/DELETE` under `/api/posts` (writes require admin JWT)
- Categories, comments, subscribe: as documented in the backend README
- Health: `GET /health` — sitemap: `GET /sitemap.xml`

## License

MIT (unless otherwise noted per package).
