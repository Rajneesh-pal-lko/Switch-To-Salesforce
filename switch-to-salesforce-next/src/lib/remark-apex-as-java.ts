import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Shiki has no first-class Apex grammar in all builds; map fenced `apex` blocks to Java for highlighting.
 */
export function remarkApexAsJava() {
  return function transformer(tree: Root) {
    visit(tree, "code", (node: { lang?: string | null }) => {
      if (node.lang === "apex") {
        node.lang = "java";
      }
    });
  };
}
