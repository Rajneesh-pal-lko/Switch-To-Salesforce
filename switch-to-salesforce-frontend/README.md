# switch-to-salesforce-frontend

Static **HTML5 / CSS3 / vanilla JavaScript** UI for **Switch To Salesforce** — tutorials, career guidance, interview prep, and Salesforce development topics (Apex, LWC, Flows, administration). No Node.js in this package: only browser code and `fetch` to the API.

## Run locally

The app loads HTML fragments from `/components` and **must be served over HTTP** (not `file://`), otherwise requests to components and the API may be blocked.

Example with Python:

```bash
cd switch-to-salesforce-frontend
python3 -m http.server 5500
```

Open `http://localhost:5500`.

Ensure the backend is running at `http://localhost:5000` (see [`switch-to-salesforce-backend/README.md`](../switch-to-salesforce-backend/README.md)).

## API base URL

`js/config.js` is loaded before `js/api.js`. Defaults:

- **Local:** `config.js` leaves `STS_API_ORIGIN` empty; `api.js` falls back to `http://localhost:5000`.
- **Production:** set `STS_API_ORIGIN` at build time — `npm run build` runs `scripts/write-api-config.js` and writes `window.STS_API_ORIGIN` from the environment variable of the same name (used on Vercel/Netlify/Cloudflare).

You can also set `window.BLOG_API_ORIGIN` or `window.STS_API_ORIGIN` inline before scripts if you prefer.

Match CORS on the server: set `FRONTEND_URL` on the backend to your deployed frontend origin.

## Structure

- Pages: `index.html`, `blog.html`, `post.html`, `category.html`, `search.html`, `about.html`, `contact.html`
- Styles: `css/main.css`, `css/components.css`, `css/responsive.css`
- Scripts: `js/config.js`, `js/api.js`, `js/main.js`, `js/search.js`, `js/post.js`
- Partials: `components/*.html` (injected at runtime)

## Features

- Docs-style layout: navbar, collapsible sidebar (Salesforce topic groups + API-driven categories), footer
- Dark mode (persisted), reading progress bar on `post.html`
- Prism.js (CDN) for syntax highlighting + copy button on `<pre><code>` blocks
- Article list with cards, pagination, related posts on article pages
- Search uses `GET /api/posts?q=`
- Newsletter form uses `POST /api/subscribe`

## Deploy the frontend (do this first)

You can ship the static site **before** the API exists. Until `STS_API_ORIGIN` points at a live API, lists and search will not load in production (or you can set it to a temporary URL and **redeploy** after the backend is up).

### Vercel (recommended)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.
3. **Configure project:**
   - **Root Directory:** `switch-to-salesforce-frontend` (click Edit).
   - **Framework Preset:** Other (or “Other” / no framework).
   - **Build Command:** `npm run build`
   - **Output Directory:** `.` (a single dot)
   - **Install Command:** `npm install`
4. **Environment Variables** (optional for first deploy):
   - `STS_API_ORIGIN` = your public API base, e.g. `https://your-api.onrender.com` (no `/api` path). Skip until the API is live; you can add it later and redeploy.
5. **Deploy.** Open the `.vercel.app` URL. All routes are files (`index.html`, `blog.html`, `post.html?slug=…`) — no SPA rewrite is required.

`vercel.json` in this folder sets build/output defaults; the dashboard settings above must still use the correct **root directory**.

### Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Pick the repo. Netlify will read the root [`netlify.toml`](../netlify.toml): base directory `switch-to-salesforce-frontend`, build `npm run build`, publish `.`
3. Under **Site configuration → Environment variables**, add `STS_API_ORIGIN` when you have the API URL, then trigger a new deploy.

### Cloudflare Pages

1. **Workers & Pages** → **Create** → **Connect to Git**, select the repo.
2. **Build configuration:**
   - **Root directory (advanced):** `switch-to-salesforce-frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `/` or `.` (site root of that folder)
3. Add environment variable **`STS_API_ORIGIN`** under **Settings → Environment variables** when ready.

### After the backend is deployed

1. Set **`STS_API_ORIGIN`** on your host to the API origin (same host you use for `GET /health`, e.g. `https://xxx.onrender.com`).
2. Trigger a **new build** so `js/config.js` is regenerated.
3. On the API, set **`FRONTEND_URL`** to your live frontend URL (exact `https://…` origin) for CORS.

Routing is file-based (`post.html?slug=...`); optional clean URLs can be added later with redirect rules.
