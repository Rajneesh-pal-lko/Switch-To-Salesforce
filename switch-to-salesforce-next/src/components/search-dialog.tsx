"use client";

import { FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { cn } from "@/lib/utils";

export type SearchIndexPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<SearchIndexPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/search.json")
      .then((r) => r.json())
      .then((data: { posts?: SearchIndexPost[] }) => {
        setPosts(data.posts ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const onSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      router.push(`/blog/${slug}`);
    },
    [router]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        if (e.key === "/" || e.key === "Escape") return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white/80 px-3 text-left text-sm text-neutral-500 shadow-sm transition",
          "hover:border-neutral-300 hover:text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-100"
        )}
        aria-label="Open search"
      >
        <Search className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 items-center gap-0.5 rounded border border-neutral-200 bg-neutral-100 px-1.5 font-mono text-[10px] font-medium text-neutral-500 sm:inline-flex dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        label="Search posts"
        overlayClassName="fixed inset-0 z-[100] bg-neutral-950/40 backdrop-blur-sm dark:bg-neutral-950/60"
        contentClassName="fixed left-1/2 top-[15vh] z-[101] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/95 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950/95"
      >
        <CommandInput
          placeholder="Search posts…"
          className="border-b border-neutral-200 text-neutral-900 dark:border-neutral-800 dark:text-neutral-100"
        />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>
            {loaded ? "No results." : "Loading…"}
          </CommandEmpty>
          <CommandGroup heading="Blog posts">
            {posts.map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.title} ${p.excerpt} ${p.category} ${p.slug}`}
                onSelect={() => onSelect(p.slug)}
                className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-900"
              >
                <FileText
                  className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                  strokeWidth={2}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {p.title}
                  </div>
                  {p.category ? (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {p.category}
                    </div>
                  ) : null}
                  {p.excerpt ? (
                    <div className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-500">
                      {p.excerpt}
                    </div>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
