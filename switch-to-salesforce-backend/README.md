# switch-to-salesforce-backend

Independent REST API for **Switch To Salesforce**: **Node.js**, **Express**, **MongoDB**. No HTML or UI assets.

## Requirements

- Node.js 18+
- MongoDB 6+ (local or Atlas)

## Setup

```bash
cd switch-to-salesforce-backend
cp .env.example .env
```

Edit `.env`:

- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/switch-to-salesforce`
- `JWT_SECRET` — long random string
- `FRONTEND_URL` — dev: `http://localhost:5500` (or your static server port)
- `SITE_URL` — public API base, e.g. `https://your-api.onrender.com`

Install dependencies:

```bash
npm install
```

Create an admin user (bcrypt-hashed password in database):

```bash
MONGODB_URI="mongodb://127.0.0.1:27017/switch-to-salesforce" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="your-secure-password" \
ADMIN_NAME="Admin" \
npm run seed
```

Run the server:

```bash
npm run dev
```

API base: `http://localhost:5000/api` (or your `PORT`).

Health check: `GET http://localhost:5000/health`  
Sitemap: `GET http://localhost:5000/sitemap.xml`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/login` | — |
| GET | `/api/posts` | — |
| GET | `/api/posts/:slug` | — |
| POST | `/api/posts` | JWT admin |
| PUT | `/api/posts/:id` | JWT admin |
| DELETE | `/api/posts/:id` | JWT admin |
| GET | `/api/categories` | — |
| POST | `/api/categories` | JWT admin |
| POST | `/api/comments` | — |
| POST | `/api/subscribe` | — |

Query params for `GET /api/posts`: `page`, `limit`, `category` (category slug), `q` (full-text search).

## Admin flows

Login:

```bash
curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-secure-password"}'
```

Use returned `token` as `Authorization: Bearer <token>`.

Create category:

```bash
curl -s -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering"}'
```

Create post (JSON, no cover image):

```bash
curl -s -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Hello World",
    "content":"<p>Intro</p><pre><code class=\"language-javascript\">console.log(\"hi\")</code></pre>",
    "author":"Admin",
    "category":"CATEGORY_OBJECT_ID",
    "tags":["news"],
    "excerpt":"Short preview"
  }'
```

Multipart with image: send `coverImage` file plus fields as form-data.

## Security

- Helmet security headers
- Rate limiting (15-minute window)
- `express-validator` on auth, comments, subscribe, categories, posts
- Passwords hashed with bcrypt; admin routes use JWT

## Deployment

- **Render / Railway / VPS**: set env vars, `npm install`, `npm start`, expose `PORT`, ensure MongoDB reachable.
- **Docker**: `docker build -t switch-to-salesforce-backend .` then run with `-p 5000:5000` and pass `-e` for env vars.

Uploaded files live under `/uploads`; persist that volume on production.
