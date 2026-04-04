#!/usr/bin/env node
/**
 * Reads MDX from content/blog and writes public/search.json for client-side search (e.g. cmdk in Phase 3).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const blogDir = path.join(root, "content", "blog");
const outFile = path.join(root, "public", "search.json");

function stripMd(raw) {
  return String(raw)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_[\]()\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFrom(content, description) {
  if (description && String(description).trim()) {
    return String(description).trim().slice(0, 280);
  }
  const t = stripMd(content);
  return t.slice(0, 220) + (t.length > 220 ? "…" : "");
}

function main() {
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(path.join(root, "public"), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify({ posts: [] }, null, 2));
    console.warn("generate-search-index: content/blog missing, wrote empty search.json");
    return;
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));
  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
      const { data, content } = matter(raw);
      const title = data.title ?? slug;
      const category = data.category != null ? String(data.category) : "";
      const dateMs = data.date ? new Date(data.date).getTime() : 0;
      return {
        slug,
        title,
        excerpt: excerptFrom(content, data.description),
        category,
        _sort: dateMs,
      };
    })
    .sort((a, b) => b._sort - a._sort)
    .map(({ _sort, ...rest }) => rest);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ posts }, null, 2));
  console.log(
    `generate-search-index: wrote ${posts.length} posts to public/search.json`
  );
}

main();
