import RSS from "rss";
import { getAllPosts } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const site = getSiteUrl();
  const feed = new RSS({
    title: "Switch to Salesforce",
    description: "Tutorials and notes for Salesforce developers and admins.",
    feed_url: `${site}/rss.xml`,
    site_url: site,
    language: "en",
  });

  const posts = getAllPosts().slice(0, 10);
  for (const post of posts) {
    feed.item({
      title: post.meta.title,
      description: post.meta.description ?? "",
      url: `${site}/blog/${post.slug}`,
      date: new Date(post.meta.date),
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
