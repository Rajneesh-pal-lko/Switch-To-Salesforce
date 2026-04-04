import Link from "next/link";
import type { ReactNode } from "react";
import type { PostData } from "@/lib/content";
import { ReadingContainer } from "@/components/reading-container";
import { slugifySegment } from "@/lib/slug";

type PostListProps = {
  posts: PostData[];
  title: string;
  description?: ReactNode;
  emptyMessage?: ReactNode;
};

export function PostList({
  posts,
  title,
  description,
  emptyMessage = "No posts found.",
}: PostListProps) {
  return (
    <ReadingContainer>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <div className="mt-2 text-neutral-600 dark:text-neutral-400">
          {description}
        </div>
      )}
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
              <h2 className="mt-1 text-xl font-semibold">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-neutral-900 transition hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-white dark:hover:text-indigo-400 dark:focus-visible:ring-offset-neutral-950"
                >
                  {post.meta.title}
                </Link>
              </h2>
              {post.meta.description && (
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {post.meta.description}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
      {posts.length === 0 && (
        <p className="mt-8 text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
      )}
    </ReadingContainer>
  );
}
