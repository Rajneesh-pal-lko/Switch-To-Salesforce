import type { MetadataRoute } from "next";
import {
  getAllCategorySlugs,
  getAllTagSlugs,
  getPostSlugs,
} from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/projects`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const posts: MetadataRoute.Sitemap = getPostSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categories: MetadataRoute.Sitemap = getAllCategorySlugs().map(
    (category) => ({
      url: `${base}/blog/category/${category}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })
  );

  const tags: MetadataRoute.Sitemap = getAllTagSlugs().map((tag) => ({
    url: `${base}/blog/tag/${tag}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...posts, ...categories, ...tags];
}
