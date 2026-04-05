# Switch to Salesforce — Next.js (App Router)

This app lives beside the legacy static site (`../switch-to-salesforce-frontend/`). Deploy it separately (e.g. another Vercel project) until you switch the deploy root.

## Phase 1 — Foundation

- **ReadingContainer** — `max-w-3xl`, centered, `leading-relaxed`
- **Inter** — body font via `next/font/google`
- **Dark mode** — `next-themes` + `ThemeToggle`
- **Home hero** — CTAs to `/blog` and `/projects`
- **AuthorBox** — bio + social links

## Phase 2 — MDX, Shiki, Giscus, SEO, search index

- **`lib/content.ts`** — reads `content/blog/*.mdx`, `gray-matter`, exports `getAllPosts()`, `getPostBySlug()`, `getPostSlugs()` (swap-in friendly for an API later).
- **MDX** — `next-mdx-remote/rsc` with `remark-gfm`, `rehype-pretty-code` + **Shiki** themes `github-light` (light) / **`one-dark-pro`** (dark). Fenced `apex` blocks are mapped to **Java** grammar via `remark-apex-as-java.ts` (Shiki has no Apex bundle everywhere).
- **`components/mdx-components.tsx`** — `Callout`, `CodeBlock`, `img` → `MDXImage`.
- **`components/Comments.tsx`** — `@giscus/react`, theme follows `next-themes`. Configure `NEXT_PUBLIC_GISCUS_*` in `.env` (see `.env.example`).
- **SEO** — `generateMetadata` on `/blog/[slug]` with **Open Graph** + **Twitter**; `metadataBase` from `getSiteUrl()` in root `layout.tsx`.
- **Search index** — `npm run search:index` or automatic at end of `npm run build` → `public/search.json` (`title`, `slug`, `excerpt`, `category`).

### Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # next build + search index
npm run search:index # regenerate public/search.json only
```

### Phase 2 — npm packages

```bash
npm install remark-gfm rehype-pretty-code shiki @giscus/react unist-util-visit
```

(`next-mdx-remote` and `gray-matter` were already added in Phase 1.)

## Content

Add posts as **`content/blog/<slug>.mdx`**.

Frontmatter:

| Field | Notes |
|--------|--------|
| `title` | Required |
| `description` | Optional; used for SEO + search excerpt |
| `date` | ISO date string |
| `category` | Optional string |
| `tags` | Optional YAML array or comma string |
| `coverImage` | Optional; path (e.g. `/og.png`) or absolute URL |
| `author` | Optional nested `name`, `bio`, `github`, `linkedin`, `trailhead` |

## Environment

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` for production OG URLs.

### Giscus comments (`components/Comments.tsx`)

Giscus uses GitHub Discussions. You need **both** of the following:

1. **Install the [Giscus GitHub App](https://github.com/apps/giscus)** on your repository ([install / configure](https://github.com/apps/giscus/installations/new), pick **Only select repositories** → `Switch-To-Salesforce` → **Install**). Without this, the UI shows *“giscus is not installed on this repository”* even when env vars are correct.
2. **Environment variables** — **`.env.example` lists the four `NEXT_PUBLIC_GISCUS_*` values** for `Rajneesh-pal-lko/Switch-To-Salesforce` (default **Announcements** category). Copy them to **`.env.local`** for local dev (or run `cp .env.example .env.local` and adjust `NEXT_PUBLIC_SITE_URL`).

For **Vercel**: **Project → Settings → Environment Variables** — add the same four keys (and `NEXT_PUBLIC_SITE_URL` = your production URL, no trailing slash). Redeploy after saving.

To use another category later, change category name/ID via [giscus.app](https://giscus.app) or the GitHub Discussions API.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GISCUS_REPO` | `owner/repo` |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | GitHub numeric repository id |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | Discussion category name |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | GitHub category `node_id` (`DIC_…`) |

**Auth:** Giscus only supports **GitHub** sign-in (comments live in GitHub Discussions). Emoji reactions on posts are enabled (`reactionsEnabled`). There is no Google-only or anonymous mode in Giscus—switching to another provider (e.g. Disqus, Hyvor, Cusdis) would be a separate integration.

## Phase 3+ (planned)

- `cmdk` search UI consuming `public/search.json`
- Richer `/projects` page
- Optional CMS/API behind `lib/content.ts`
