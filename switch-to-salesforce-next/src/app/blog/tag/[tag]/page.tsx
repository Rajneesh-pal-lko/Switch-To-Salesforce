import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { getAllTagSlugs, getPostsByTag } from "@/lib/content";
import { slugifySegment } from "@/lib/slug";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return getAllTagSlugs().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  const human =
    posts[0]?.meta.tags?.find((t) => slugifySegment(t) === tag) ?? tag;
  return {
    title: `${human} — Blog`,
    description: `Posts tagged “${human}”.`,
  };
}

export default async function BlogTagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  const displayName =
    posts[0]?.meta.tags?.find((t) => slugifySegment(t) === tag) ?? tag;

  return (
    <>
      <SiteHeader />
      <div className="pb-16 pt-10">
        <PostList
          posts={posts}
          title={`#${displayName}`}
          description={
            <>
              {posts.length} post{posts.length === 1 ? "" : "s"} with this tag.{" "}
              <Link
                href="/blog"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                All posts
              </Link>
            </>
          }
        />
      </div>
    </>
  );
}
