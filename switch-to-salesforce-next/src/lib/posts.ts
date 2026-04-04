import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

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
  author?: AuthorMeta;
};

export type PostData = {
  slug: string;
  meta: PostFrontmatter;
  content: string;
};

function assertPostsDir() {
  if (!fs.existsSync(POSTS_DIR)) {
    return false;
  }
  return true;
}

export function getPostSlugs(): string[] {
  if (!assertPostsDir()) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): PostData | null {
  if (!assertPostsDir()) return null;
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const meta = data as PostFrontmatter;
  return {
    slug,
    meta: {
      title: meta.title,
      description: meta.description,
      date: meta.date,
      author: meta.author,
    },
    content,
  };
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
