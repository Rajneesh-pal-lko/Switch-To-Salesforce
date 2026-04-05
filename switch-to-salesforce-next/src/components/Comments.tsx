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
      <details className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900/50">
        <summary className="cursor-pointer font-medium text-neutral-800 dark:text-neutral-200">
          Comments show “giscus is not installed”?
        </summary>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Environment variables are not enough. Install the{" "}
          <a
            href="https://github.com/apps/giscus"
            className="font-medium text-indigo-600 underline dark:text-indigo-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Giscus GitHub App
          </a>{" "}
          on{" "}
          <code className="rounded bg-neutral-200/80 px-1 text-xs dark:bg-neutral-800">
            {repo}
          </code>
          :{" "}
          <a
            href="https://github.com/apps/giscus/installations/new"
            className="font-medium text-indigo-600 underline dark:text-indigo-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Install or configure the app
          </a>
          , choose this repository, then reload the page.
        </p>
      </details>
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
