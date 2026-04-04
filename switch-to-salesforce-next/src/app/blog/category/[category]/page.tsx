import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import {
  getAllCategorySlugs,
  getPostsByCategory,
} from "@/lib/content";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  const label = posts[0]?.meta.category ?? category;
  return {
    title: `${label} — Blog`,
    description: `Posts in “${label}”.`,
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  if (posts.length === 0) notFound();

  const displayName = posts[0]?.meta.category ?? category;

  return (
    <>
      <SiteHeader />
      <div className="pb-16 pt-10">
        <PostList
          posts={posts}
          title={displayName}
          description={
            <>
              {posts.length} post{posts.length === 1 ? "" : "s"} in this
              category.{" "}
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
