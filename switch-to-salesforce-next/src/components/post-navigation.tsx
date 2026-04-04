import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostData } from "@/lib/content";

type PostNavigationProps = {
  prev: PostData | null;
  next: PostData | null;
};

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;
  return (
    <nav
      className="mt-12 grid gap-4 border-t border-neutral-200 pt-10 dark:border-neutral-800 sm:grid-cols-2"
      aria-label="Adjacent posts"
    >
      <div className="min-w-0">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex flex-col rounded-xl border border-transparent px-2 py-3 transition hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50"
          >
            <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              Previous
            </span>
            <span className="mt-1 truncate font-semibold text-neutral-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {prev.meta.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </div>
      <div className="min-w-0 text-right sm:text-right">
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex flex-col items-end rounded-xl border border-transparent px-2 py-3 text-right transition hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50"
          >
            <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Next
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="mt-1 max-w-full truncate font-semibold text-neutral-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {next.meta.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
