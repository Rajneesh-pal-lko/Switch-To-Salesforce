"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function useGiscusTheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return "light";
  return resolvedTheme === "dark" ? "dark" : "light";
}

export function Comments() {
  const theme = useGiscusTheme();
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  const configured =
    repo && repoId && category && categoryId && repo.includes("/");

  if (!configured) {
    return (
      <div className="mt-12 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
        Comments are not configured. Set{" "}
        <code className="rounded bg-neutral-200 px-1 py-0.5 text-xs dark:bg-neutral-800">
          NEXT_PUBLIC_GISCUS_*
        </code>{" "}
        environment variables to enable Giscus.
      </div>
    );
  }

  return (
    <div className="mt-12 giscus-container">
      <Giscus
        id="comments"
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
