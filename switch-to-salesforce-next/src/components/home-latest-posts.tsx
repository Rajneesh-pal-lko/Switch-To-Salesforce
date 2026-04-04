import Link from "next/link";
import { ReadingContainer } from "@/components/reading-container";
import { getAllPosts } from "@/lib/content";
import { slugifySegment } from "@/lib/slug";

export function HomeLatestPosts() {
  const posts = getAllPosts().slice(0, 5);

  if (posts.length === 0) {
    return (
      <section className="border-t border-neutral-200 py-16 dark:border-neutral-800">
        <ReadingContainer>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Blog
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            No posts yet. Add <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm dark:bg-neutral-800">.mdx</code>{" "}
            files under{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm dark:bg-neutral-800">
              content/blog
            </code>{" "}
            and redeploy.
          </p>
        </ReadingContainer>
      </section>
    );
  }

  return (
    <section className="border-t border-neutral-200 py-16 dark:border-neutral-800">
      <ReadingContainer>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Latest from the blog
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Tutorials, patterns, and notes for Salesforce developers and admins.
            </p>
          </div>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all posts →
          </Link>
        </div>
        <ul className="mt-10 divide-y divide-neutral-200 dark:divide-neutral-800">
          {posts.map((post) => (
            <li key={post.slug} className="py-6 first:pt-0">
              <article>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {new Date(post.meta.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {post.meta.category ? (
                    <>
                      {" "}
                      <span className="text-neutral-400 dark:text-neutral-500">
                        ·{" "}
                        <Link
                          href={`/blog/category/${slugifySegment(post.meta.category)}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {post.meta.category}
                        </Link>
                      </span>
                    </>
                  ) : null}
                  <span className="text-neutral-400 dark:text-neutral-500">
                    {" "}
                    · {post.readingTime} min read
                  </span>
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-neutral-900 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {post.meta.title}
                  </Link>
                </h3>
                {post.meta.description ? (
                  <p className="mt-2 line-clamp-2 text-neutral-600 dark:text-neutral-400">
                    {post.meta.description}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </ReadingContainer>
    </section>
  );
}
