import type { Metadata } from "next";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tutorials and notes for Salesforce developers and admins.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <SiteHeader />
      <div className="pb-16 pt-10">
        <PostList
          posts={posts}
          title="Blog"
          description={
            <>
              Posts are local MDX in{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm dark:bg-neutral-800">
                content/blog
              </code>{" "}
              — sorted by date.
            </>
          }
          emptyMessage={
            <>
              No posts yet. Add a <code>.mdx</code> file under{" "}
              <code>content/blog</code>.
            </>
          }
        />
      </div>
    </>
  );
}
