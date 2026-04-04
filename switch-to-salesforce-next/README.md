# Switch to Salesforce — Next.js (App Router)

This app lives beside the legacy static site (`../switch-to-salesforce-frontend/`). Deploy it separately (e.g. another Vercel project) until you switch the deploy root.

## Phase 1 — Foundation

- **ReadingContainer** — `max-w-3xl`, centered, `leading-relaxed`
- **Inter** — body font via `next/font/google`
- **Dark mode** — `next-themes` + `ThemeToggle` (Sun/Moon via `lucide-react`)
- **Home hero** — H1 *Mastering the Switch to Salesforce*, subcopy, CTAs to `/blog` and `/projects`
- **Blog** — local MDX in `content/posts/`, rendered with `next-mdx-remote` (RSC)
- **AuthorBox** — avatar placeholder, bio, GitHub / LinkedIn / Trailhead links

### Commands

From this folder:

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Phase 1 — packages (already in package.json)

Scaffold + foundation dependencies:

```bash
npm install next@15 react react-dom next-themes lucide-react next-mdx-remote gray-matter clsx tailwind-merge
npm install -D @tailwindcss/typography typescript tailwindcss postcss eslint eslint-config-next @types/node @types/react @types/react-dom
```

`create-next-app` was used once to generate the project; the versions above match the committed `package.json`.

## Content

Add posts as `content/posts/<slug>.mdx` with YAML frontmatter (`title`, `description`, `date`, optional `author`).

## Phase 2+ (planned)

- Shiki, Giscus (env placeholders reserved), `generateMetadata` enhancements, cmdk search, categories/tags, `/projects` content.
