import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorBox } from "@/components/author-box";
import { ReadingContainer } from "@/components/reading-container";
import { SiteHeader } from "@/components/site-header";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return {
    title: post.meta.title,
    description: post.meta.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { meta, content } = post;
  const author = meta.author;

  return (
    <>
      <SiteHeader />
      <article className="pb-16 pt-8">
        <ReadingContainer>
          <nav className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
            <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              ← Blog
            </Link>
          </nav>
          <header className="mb-10">
            <time
              dateTime={meta.date}
              className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
            >
              {new Date(meta.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              {meta.title}
            </h1>
            {meta.description && (
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
                {meta.description}
              </p>
            )}
          </header>
          <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-pre:bg-neutral-900 prose-pre:text-neutral-100">
            <MDXRemote source={content} />
          </div>
          {author && (
            <AuthorBox
              name={author.name}
              bio={author.bio}
              githubUrl={author.github}
              linkedinUrl={author.linkedin}
              trailheadUrl={author.trailhead}
            />
          )}
        </ReadingContainer>
      </article>
    </>
  );
}
