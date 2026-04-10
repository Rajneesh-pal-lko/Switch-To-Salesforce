import GithubSlugger from "github-slugger";
import { headingRank } from "hast-util-heading-rank";
import { toString } from "hast-util-to-string";
import type { Element, Nodes, Root } from "hast";
import { visit } from "unist-util-visit";

type MdxJsxHeading = {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string;
  attributes: Array<{
    type: string;
    name?: string;
    value?: unknown;
  }>;
  children?: Nodes[];
};

function jsxHeadingRank(name: string): number | undefined {
  const n = name.toLowerCase();
  if (n.length !== 2 || n[0] !== "h") return undefined;
  const d = n.charCodeAt(1) - 48;
  return d >= 1 && d <= 6 ? d : undefined;
}

function mdxJsxIdAttr(node: MdxJsxHeading): string | undefined {
  const a = node.attributes?.find(
    (x) => x.type === "mdxJsxAttribute" && x.name === "id"
  );
  if (!a || typeof a.value !== "string") return undefined;
  return a.value;
}

/** Plain text for slugging; matches how readers see the heading. */
function mdxJsxPlainText(nodes: readonly Nodes[] | undefined): string {
  if (!nodes?.length) return "";
  let s = "";
  for (const n of nodes) {
    if (n.type === "text" && "value" in n) {
      s += String(n.value);
    } else if (
      (n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement") &&
      "children" in n
    ) {
      s += mdxJsxPlainText((n as MdxJsxHeading).children);
    } else if (n.type === "element" && "children" in n) {
      s += mdxJsxPlainText((n as Element).children);
    }
  }
  return s.trim();
}

/**
 * Assign stable `id` to h2/h3 so TOC and `rehype-slug` align with
 * `getTableOfContents` (github-slugger, document order).
 *
 * MDX `<h2>` becomes `mdxJsxFlowElement`, which `rehype-slug` does not handle.
 */
export default function rehypeHeadingIds() {
  return (tree: Root) => {
    const slugger = new GithubSlugger();
    visit(tree, (node) => {
      if (node.type === "element") {
        const el = node as Element;
        const rank = headingRank(el);
        if (rank !== 2 && rank !== 3) return;
        if (el.properties && el.properties.id) return;
        const text = toString(el).trim();
        if (!text) return;
        el.properties = el.properties ?? {};
        el.properties.id = slugger.slug(text);
        return;
      }
      if (
        node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement"
      ) {
        const el = node as MdxJsxHeading;
        const rank = jsxHeadingRank(el.name);
        if (rank !== 2 && rank !== 3) return;
        if (mdxJsxIdAttr(el)) return;
        const text = mdxJsxPlainText(el.children);
        if (!text) return;
        const id = slugger.slug(text);
        el.attributes = el.attributes ?? [];
        el.attributes.push({ type: "mdxJsxAttribute", name: "id", value: id });
      }
    });
  };
}
