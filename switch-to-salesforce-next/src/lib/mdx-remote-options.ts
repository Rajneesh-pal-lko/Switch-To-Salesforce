import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { remarkApexAsJava } from "@/lib/remark-apex-as-java";

/**
 * Shared MDX compile options for next-mdx-remote (RSC).
 * Order: pretty-code → slug IDs → autolinks on h2/h3.
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
      rehypeSlug,
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
