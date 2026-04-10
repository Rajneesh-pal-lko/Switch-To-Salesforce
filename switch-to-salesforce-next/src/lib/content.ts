import fs from "fs";
import path from "path";
import Slugger from "github-slugger";
import matter from "gray-matter";
import type { Heading, Root } from "mdast";
import { toString } from "mdast-util-to-string";
import readingTime from "reading-time";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { slugifySegment } from "@/lib/slug";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type AuthorMeta = {
  name: string;
  bio: string;
  github?: string;
  linkedin?: string;
  trailhead?: string;
};

export type PostFrontmatter = {
  title: string;
  description?: string;
  date: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  author?: AuthorMeta;
};

export type PostData = {
  slug: string;
  meta: PostFrontmatter;
  content: string;
  /** Estimated minutes to read (rounded). */
  readingTime: number;
};

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

function blogDirExists() {
  return fs.existsSync(BLOG_DIR);
}

/**
 * Extract h2/h3 from raw MDX via mdast (`remark-parse` + `remark-mdx` + `remark-gfm`).
 * IDs use `github-slugger` in document order to align with `rehype-slug` on rendered HTML.
 */
export function getTableOfContents(content: string): TocItem[] {
  const slugger = new Slugger();
  let tree: Root;
  try {
    tree = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .parse(content) as Root;
  } catch {
    return [];
  }
  const out: TocItem[] = [];

  /** One preorder walk so markdown `##` and JSX `<h2>` / `<h3>` stay in document order. */
  visit(tree, (node) => {
    if (node.type === "heading") {
      const h = node as Heading;
      if (h.depth !== 2 && h.depth !== 3) return;
      const title = toString(h).trim();
      if (!title) return;
      out.push({
        id: slugger.slug(title),
        title,
        level: h.depth as 2 | 3,
      });
      return;
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      const n = node as MdxJsxHeading;
      if (n.name !== "h2" && n.name !== "h3") return;
      const title = toString(node as Parameters<typeof toString>[0]).trim();
      if (!title) return;
      out.push({
        id: slugger.slug(title),
        title,
        level: n.name === "h2" ? 2 : 3,
      });
    }
  });

  return out;
}

type MdxJsxHeading = {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string;
};

export function getPostSlugs(): string[] {
  if (!blogDirExists()) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function normalizeFrontmatter(data: Record<string, unknown>): PostFrontmatter {
  const tags = data.tags;
  return {
    title: String(data.title ?? "Untitled"),
    description: data.description != null ? String(data.description) : undefined,
    date: String(data.date ?? new Date().toISOString().slice(0, 10)),
    category: data.category != null ? String(data.category) : undefined,
    tags: Array.isArray(tags)
      ? tags.map(String)
      : typeof tags === "string"
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    coverImage: data.coverImage != null ? String(data.coverImage) : undefined,
    author: data.author as AuthorMeta | undefined,
  };
}

function computeReadingMinutes(content: string): number {
  const stats = readingTime(content);
  return Math.max(1, Math.round(stats.minutes));
}

function buildPost(slug: string, meta: PostFrontmatter, content: string): PostData {
  return {
    slug,
    meta,
    content,
    readingTime: computeReadingMinutes(content),
  };
}

export function getPostBySlug(slug: string): PostData | null {
  if (!blogDirExists()) return null;
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const meta = normalizeFrontmatter(data as Record<string, unknown>);
  return buildPost(slug, meta, content);
}

export function getAllPosts(): PostData[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is PostData => p !== null)
    .sort(
      (a, b) =>
        new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
    );
}

/** Chronological order (oldest → newest) for prev/next navigation. */
export function getAllPostsChronological(): PostData[] {
  return [...getAllPosts()].sort(
    (a, b) =>
      new Date(a.meta.date).getTime() - new Date(b.meta.date).getTime()
  );
}

export function getPostsByCategory(categorySlug: string): PostData[] {
  const target = slugifySegment(categorySlug);
  return getAllPosts().filter((p) => {
    if (!p.meta.category) return false;
    return slugifySegment(p.meta.category) === target;
  });
}

export function getPostsByTag(tagSlug: string): PostData[] {
  const target = slugifySegment(tagSlug);
  return getAllPosts().filter((p) =>
    (p.meta.tags ?? []).some((t) => slugifySegment(t) === target)
  );
}

export function getAdjacentPosts(currentSlug: string): {
  prev: PostData | null;
  next: PostData | null;
} {
  const sorted = getAllPostsChronological();
  const i = sorted.findIndex((p) => p.slug === currentSlug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? sorted[i - 1]! : null,
    next: i < sorted.length - 1 ? sorted[i + 1]! : null,
  };
}

export function getAllCategorySlugs(): string[] {
  const set = new Set<string>();
  for (const p of getAllPosts()) {
    if (p.meta.category) {
      set.add(slugifySegment(p.meta.category));
    }
  }
  return [...set];
}

export function getAllTagSlugs(): string[] {
  const set = new Set<string>();
  for (const p of getAllPosts()) {
    for (const t of p.meta.tags ?? []) {
      set.add(slugifySegment(t));
    }
  }
  return [...set];
}
