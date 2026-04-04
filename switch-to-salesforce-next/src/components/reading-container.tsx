import { cn } from "@/lib/utils";

type ReadingContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

/**
 * Constrains long-form content to a comfortable measure (~768px / max-w-3xl),
 * centered, with relaxed line height for readability.
 */
export function ReadingContainer({
  children,
  className,
  as: Component = "div",
}: ReadingContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-3xl px-4 sm:px-6 leading-relaxed",
        className
      )}
    >
      {children}
    </Component>
  );
}
