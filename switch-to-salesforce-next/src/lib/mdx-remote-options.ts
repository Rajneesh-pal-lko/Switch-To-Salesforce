import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import rehypeHeadingIds from "@/lib/rehype-heading-ids";
import { remarkApexAsJava } from "@/lib/remark-apex-as-java";

/**
 * Shared MDX compile options for next-mdx-remote (RSC).
 * Order: pretty-code → h2/h3 ids (incl. MDX JSX headings) → autolinks on h2/h3.
 */
export const mdxRemoteOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkApexAsJava],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: {
            light: "github-light",
            dark: "one-dark-pro",
          },
          keepBackground: true,
        },
      ],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          test: (node: { tagName?: string }) =>
            node.tagName === "h2" || node.tagName === "h3",
        },
      ],
    ],
  },
};
