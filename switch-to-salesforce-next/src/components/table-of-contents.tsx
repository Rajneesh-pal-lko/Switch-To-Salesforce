"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/content";
import { cn } from "@/lib/utils";

type TableOfContentsProps = {
  items: TocItem[];
};

/** Aligns with sticky header (`h-14` + offset). */
const TOP_MARGIN_PX = 96;

/**
 * Highlights the current section using IntersectionObserver on each heading id.
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(
    items[0]?.id ?? null
  );
  const visibleRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;

    const visible = visibleRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        let last: string | null = null;
        for (const item of items) {
          if (visible.has(item.id)) last = item.id;
        }
        setActiveId((prev) => last ?? prev ?? items[0]?.id ?? null);
      },
      {
        root: null,
        rootMargin: `-${TOP_MARGIN_PX}px 0px -55% 0px`,
        threshold: [0, 1],
      }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => {
      visible.clear();
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto text-sm"
    >
      <p className="mb-3 font-semibold text-neutral-900 dark:text-white">
        On this page
      </p>
      <ul className="space-y-1 border-l border-neutral-200 dark:border-neutral-800">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: item.level === 3 ? "0.75rem" : "0" }}
          >
            <a
              href={`#${item.id}`}
              className={cn(
                "block border-l-2 border-transparent py-1 pl-3 text-neutral-600 transition hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400",
                activeId === item.id &&
                  "border-indigo-500 font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-300"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
