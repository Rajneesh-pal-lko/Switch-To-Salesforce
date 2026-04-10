import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorBox } from "@/components/author-box";
import { Comments } from "@/components/Comments";
import { mdxComponents } from "@/components/mdx-components";
import { PostNavigation } from "@/components/post-navigation";
import { ReadingContainer } from "@/components/reading-container";
import { SiteHeader } from "@/components/site-header";
import { TableOfContents } from "@/components/table-of-contents";
import {
  getAdjacentPosts,
  getPostBySlug,
  getPostSlugs,
  getTableOfContents,
} from "@/lib/content";
import { mdxRemoteOptions } from "@/lib/mdx-remote-options";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { slugifySegment } from "@/lib/slug";

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

  const { meta } = post;
  const title = meta.title;
  const description = meta.description ?? "";
  const site = getSiteUrl();
  const ogImage =
    meta.coverImage && meta.coverImage.length > 0
      ? absoluteUrl(meta.coverImage)
      : undefined;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      url: `${site}/blog/${slug}`,
      title,
      description,
      publishedTime: meta.date,
      ...(ogImage && { images: [{ url: ogImage, alt: title }] }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { meta, content } = post;
  const author = meta.author;
  const toc = getTableOfContents(content);
  const { prev, next } = getAdjacentPosts(slug);

  return (
    <>
      <SiteHeader />
      <article className="pb-16 pt-8">
        <ReadingContainer className="max-w-6xl">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12 xl:gap-16">
            <div className="min-w-0 max-w-3xl">
              <nav className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
                <Link
                  href="/blog"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  ← Blog
                </Link>
              </nav>
              <header className="mb-10">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <time dateTime={meta.date}>
                    {new Date(meta.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{post.readingTime} min read</span>
                  {meta.category && (
                    <>
                      <span aria-hidden>·</span>
                      <Link
                        href={`/blog/category/${slugifySegment(meta.category)}`}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700 transition hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
                      >
                        {meta.category}
                      </Link>
                    </>
                  )}
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                  {meta.title}
                </h1>
                {meta.description && (
                  <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
                    {meta.description}
                  </p>
                )}
                {meta.tags && meta.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {meta.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/blog/tag/${slugifySegment(tag)}`}
                          className="inline-block rounded-md border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {meta.coverImage && meta.coverImage.length > 0 && (
                  <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={absoluteUrl(meta.coverImage)}
                      alt=""
                      className="h-auto w-full object-cover"
                    />
                  </div>
                )}
              </header>
              <div className="article-html-guide not-prose max-w-none">
                <div className="blog">
                  <MDXRemote
                    source={content}
                    options={
                      mdxRemoteOptions as NonNullable<MDXRemoteProps["options"]>
                    }
                    components={mdxComponents}
                  />
                </div>
              </div>
              <PostNavigation prev={prev} next={next} />
              {author && (
                <AuthorBox
                  name={author.name}
                  bio={author.bio}
                  githubUrl={author.github}
                  linkedinUrl={author.linkedin}
                  trailheadUrl={author.trailhead}
                />
              )}
              <Comments />
            </div>
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <TableOfContents items={toc} />
              </aside>
            )}
          </div>
        </ReadingContainer>
      </article>
    </>
  );
}
