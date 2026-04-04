import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

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
  children,
}: {
  language?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-100 dark:border-neutral-800">
      {language ? (
        <div className="border-b border-neutral-800 px-3 py-1.5 font-mono text-xs font-medium text-neutral-400">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code>{children}</code>
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
