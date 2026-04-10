const GithubSlugger = require('github-slugger').default;
const { headingRank } = require('hast-util-heading-rank');
const { toString } = require('hast-util-to-string');
const { visit } = require('unist-util-visit');

function jsxHeadingRank(name) {
  const n = String(name).toLowerCase();
  if (n.length !== 2 || n[0] !== 'h') return undefined;
  const d = n.charCodeAt(1) - 48;
  return d >= 1 && d <= 6 ? d : undefined;
}

function mdxJsxIdAttr(node) {
  const a = node.attributes?.find((x) => x.type === 'mdxJsxAttribute' && x.name === 'id');
  if (!a || typeof a.value !== 'string') return undefined;
  return a.value;
}

function mdxJsxPlainText(nodes) {
  if (!nodes?.length) return '';
  let s = '';
  for (const n of nodes) {
    if (n.type === 'text' && 'value' in n) {
      s += String(n.value);
    } else if (
      (n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') &&
      n.children
    ) {
      s += mdxJsxPlainText(n.children);
    } else if (n.type === 'element' && n.children) {
      s += mdxJsxPlainText(n.children);
    }
  }
  return s.trim();
}

function rehypeHeadingIds() {
  return (tree) => {
    const slugger = new GithubSlugger();
    visit(tree, (node) => {
      if (node.type === 'element') {
        const el = node;
        const rank = headingRank(el);
        if (rank !== 2 && rank !== 3) return;
        if (el.properties && el.properties.id) return;
        const text = toString(el).trim();
        if (!text) return;
        el.properties = el.properties ?? {};
        el.properties.id = slugger.slug(text);
        return;
      }
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        const el = node;
        const rank = jsxHeadingRank(el.name);
        if (rank !== 2 && rank !== 3) return;
        if (mdxJsxIdAttr(el)) return;
        const text = mdxJsxPlainText(el.children);
        if (!text) return;
        const id = slugger.slug(text);
        el.attributes = el.attributes ?? [];
        el.attributes.push({ type: 'mdxJsxAttribute', name: 'id', value: id });
      }
    });
  };
}

module.exports = rehypeHeadingIds;
