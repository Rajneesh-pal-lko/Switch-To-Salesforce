"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import type { TocItem } from "@/lib/content";
import { cn } from "@/lib/utils";

type TableOfContentsProps = {
  items: TocItem[];
};

/** Sticky site header + offset so the heading isn’t hidden under the bar. */
const HEADER_OFFSET_PX = 96;

/**
 * Highlights the section whose heading is nearest above the offset line, and
 * supports smooth scroll on click (more reliable than hash-only with MDX ids).
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(
    () => items[0]?.id ?? null
  );

  const pickActive = useCallback(() => {
    if (items.length === 0) return;
    let current: string | null = null;
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top <= HEADER_OFFSET_PX) current = item.id;
      else break;
    }
    setActiveId(current ?? items[0]?.id ?? null);
  }, [items]);

  useEffect(() => {
    pickActive();
    window.addEventListener("scroll", pickActive, { passive: true });
    window.addEventListener("resize", pickActive);
    return () => {
      window.removeEventListener("scroll", pickActive);
      window.removeEventListener("resize", pickActive);
    };
  }, [pickActive]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

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
              onClick={(e) => onClick(e, item.id)}
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
