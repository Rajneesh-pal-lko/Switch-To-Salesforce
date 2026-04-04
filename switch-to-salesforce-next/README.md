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

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` for production OG URLs. Add Giscus variables when ready.

## Phase 3+ (planned)

- `cmdk` search UI consuming `public/search.json`
- Richer `/projects` page
- Optional CMS/API behind `lib/content.ts`
