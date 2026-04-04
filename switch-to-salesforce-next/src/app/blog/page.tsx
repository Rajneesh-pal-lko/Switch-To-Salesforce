import type { Metadata } from "next";
import Link from "next/link";
import { ReadingContainer } from "@/components/reading-container";
import { SiteHeader } from "@/components/site-header";
import { getAllPosts } from "@/lib/posts";

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
        <ReadingContainer>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Learning notes and guides — served from local MDX in{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm dark:bg-neutral-800">
              content/posts
            </code>
            .
          </p>
          <ul className="mt-10 divide-y divide-neutral-200 dark:divide-neutral-800">
            {posts.map((post) => (
              <li key={post.slug} className="py-6 first:pt-0">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
                >
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(post.meta.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-neutral-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {post.meta.title}
                  </h2>
                  {post.meta.description && (
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                      {post.meta.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          {posts.length === 0 && (
            <p className="mt-8 text-neutral-500 dark:text-neutral-400">
              No posts yet. Add a <code>.mdx</code> file under{" "}
              <code>content/posts</code>.
            </p>
          )}
        </ReadingContainer>
      </div>
    </>
  );
}
