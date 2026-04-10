import type { MDXComponents } from "mdx/types";
import * as React from "react";
import { cn } from "@/lib/utils";

function collectText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number")
    return String(node);
  if (Array.isArray(node)) return node.map(collectText).join("");
  if (React.isValidElement(node)) {
    const ch = (node.props as { children?: React.ReactNode }).children;
    if (ch != null) return collectText(ch);
  }
  return "";
}

export type CalloutType = "info" | "warning" | "error";

const calloutStyles: Record<CalloutType, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/35 dark:text-blue-50",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-50",
  error:
    "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/35 dark:text-red-50",
};

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "my-6 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        calloutStyles[type]
      )}
    >
      {children}
    </aside>
  );
}

/** Manual code snippets in MDX (fenced blocks use Shiki via rehype-pretty-code). */
export function CodeBlock({
  language,
  code,
  children,
}: {
  language?: string;
  /** Prefer `code` — RSC MDX often does not pass template-literal children through. */
  code?: string;
  children?: React.ReactNode;
}) {
  const text =
    typeof code === "string" && code.length > 0 ? code : collectText(children);
  return (
    <div
      className={cn(
        "not-prose my-6 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-100 dark:border-neutral-800"
      )}
    >
      {language ? (
        <div className="border-b border-neutral-800 px-3 py-1.5 font-mono text-xs font-medium text-neutral-400">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-neutral-100">
        <code className="block min-w-0 whitespace-pre bg-transparent p-0 font-mono text-[13px] leading-relaxed text-neutral-100">
          {text}
        </code>
      </pre>
    </div>
  );
}

export function MDXImage({
  className,
  alt,
  ...props
}: React.ComponentPropsWithoutRef<"img">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      className={cn(
        "my-6 h-auto max-w-full rounded-xl border border-neutral-200 dark:border-neutral-800",
        className
      )}
      loading="lazy"
      {...props}
    />
  );
}

export const mdxComponents: MDXComponents = {
  Callout,
  CodeBlock,
  img: MDXImage,
};
