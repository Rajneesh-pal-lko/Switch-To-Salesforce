const sanitizeHtml = require('sanitize-html');

/**
 * Allow-listed HTML for rich article/post content (TinyMCE output).
 * Strips scripts, inline event handlers, and unknown tags.
 */
const RICH_HTML = {
  allowedTags: [
    'p',
    'br',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'a',
    'img',
    'code',
    'pre',
    'blockquote',
    'hr',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    code: ['class'],
    pre: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowProtocolRelative: true,
};

const LAYOUT_TAG_NAMES = [
  'p',
  'br',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'a',
  'img',
  'code',
  'pre',
  'blockquote',
  'hr',
  'div',
  'span',
  'section',
  'article',
  'header',
  'footer',
  'aside',
  'nav',
  'main',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'caption',
  'figure',
  'figcaption',
  'style',
  /* Diagrams: hub/spoke lines are often drawn with inline SVG; previously stripped entirely */
  'svg',
  'g',
  'line',
  'path',
  'circle',
  'defs',
  'title',
  'desc',
  'text',
  'tspan',
];

/**
 * Inline style allow-list (sanitize-html uses PostCSS on style="...").
 * Keys are CSS properties; values are regexes that must match the full value.
 */
const LAYOUT_ALLOWED_STYLES = {
  '*': {
    color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i, /^rgba\(/i, /^hsl\(/i, /^hsla\(/i, /^inherit$/i, /^currentColor$/i],
    'background-color': [
      /^#[0-9a-f]{3,8}$/i,
      /^rgb\(/i,
      /^rgba\(/i,
      /^hsl\(/i,
      /^hsla\(/i,
      /^transparent$/i,
      /^inherit$/i,
    ],
    background: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^rgba\(/i, /^hsl\(/i, /^transparent$/i, /^none$/i],
    'background-image': [/^url\(\s*["']?https?:\/\/[^"')]+\s*["']?\s*\)$/i, /^none$/i],
    'font-size': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'font-weight': [/^\d{3}$/, /^bold$/i, /^normal$/i, /^lighter$/i, /^bolder$/i],
    'font-family': [/^[\w\s\-'",.]+$/],
    'line-height': [/^\d+(\.\d+)?$/, /^\d+(\.\d+)?(px|em|rem)$/],
    'text-align': [/^(left|right|center|justify)$/i],
    'text-decoration': [/^(none|underline|line-through|overline)$/i],
    'vertical-align': [/^(top|middle|bottom|baseline|sub|super)$/i],
    margin: [/^[\d.\s\-pxem%]+$/],
    'margin-top': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'margin-right': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'margin-bottom': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'margin-left': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    padding: [/^[\d.\s\-pxem%]+$/],
    'padding-top': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'padding-right': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'padding-bottom': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'padding-left': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    width: [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'max-width': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'min-width': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    height: [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'max-height': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'min-height': [/^\d+(\.\d+)?(px|em|rem|%)$/],
    border: [/^[^;]{0,240}$/],
    'border-top': [/^[^;]{0,200}$/],
    'border-right': [/^[^;]{0,200}$/],
    'border-bottom': [/^[^;]{0,200}$/],
    'border-left': [/^[^;]{0,200}$/],
    'border-radius': [/^[\d.\spxem%]+$/],
    'border-collapse': [/^(collapse|separate)$/i],
    display: [/^(block|inline|inline-block|flex|inline-flex|grid|none|table|table-row|table-cell)$/i],
    'flex-direction': [/^(row|column|row-reverse|column-reverse)$/i],
    'justify-content': [/^(flex-start|flex-end|center|space-between|space-around|space-evenly)$/i],
    'align-items': [/^(flex-start|flex-end|center|stretch|baseline)$/i],
    'align-self': [/^(auto|flex-start|flex-end|center|stretch|baseline)$/i],
    flex: [/^[\d\s]+$/],
    'flex-wrap': [/^(nowrap|wrap|wrap-reverse)$/i],
    gap: [/^\d+(\.\d+)?(px|em|rem)$/],
    overflow: [/^(visible|hidden|auto|scroll)$/i],
    'overflow-x': [/^(visible|hidden|auto|scroll)$/i],
    'overflow-y': [/^(visible|hidden|auto|scroll)$/i],
    position: [/^(static|relative|absolute|fixed|sticky)$/i],
    top: [/^\d+(\.\d+)?(px|em|rem|%)$/, /^auto$/i],
    right: [/^\d+(\.\d+)?(px|em|rem|%)$/, /^auto$/i],
    bottom: [/^\d+(\.\d+)?(px|em|rem|%)$/, /^auto$/i],
    left: [/^\d+(\.\d+)?(px|em|rem|%)$/, /^auto$/i],
    'z-index': [/^-?\d+$/],
    opacity: [/^0?\.\d+$/, /^1$/, /^0$/],
    'box-shadow': [/^[^;]{0,400}$/],
    'letter-spacing': [/^\d+(\.\d+)?(px|em)$/],
    'list-style': [/^[^;]{0,120}$/],
    'list-style-type': [/^(disc|circle|square|decimal|lower-alpha|upper-alpha|none)$/i],
    'white-space': [/^(normal|nowrap|pre|pre-wrap|pre-line)$/i],
    float: [/^(left|right|none)$/i],
    clear: [/^(left|right|both|none)$/i],
    'grid-template-columns': [/^[\w\s\d%.,()+-]+$/],
    'grid-template-rows': [/^[\w\s\d%.,()+-]+$/],
    'grid-column': [/^[\w\s/+-]+$/],
    'grid-row': [/^[\w\s/+-]+$/],
    'column-gap': [/^\d+(\.\d+)?(px|em|rem)$/],
    'row-gap': [/^\d+(\.\d+)?(px|em|rem)$/],
    transform: [
      /^none$/i,
      /^(rotate|translate|translate3d|translateX|translateY|scale|matrix)\([^)]+\)$/,
    ],
    'transform-origin': [/^[\w\s%.,\-+]+$/],
    fill: [/^none$/i, /^currentColor$/i, /^#[0-9a-f]{3,8}$/i, /^rgb\(/i, /^url\(#[\w-]+\)$/],
    stroke: [/^none$/i, /^currentColor$/i, /^#[0-9a-f]{3,8}$/i, /^rgb\(/i],
    'stroke-width': [/^\d+(\.\d+)?(px)?$/],
    'stroke-dasharray': [/^[0-9\s.,]+$/],
    'stroke-linecap': [/^(butt|round|square)$/i],
    'stroke-linejoin': [/^(miter|round|bevel)$/i],
    'dominant-baseline': [/^(auto|middle|central|hanging|alphabetic)$/i],
    'text-anchor': [/^(start|middle|end)$/i],
  },
};

/** class + optional id + inline style (filtered) for layout-oriented HTML articles */
const LAYOUT_ALLOWED_ATTRIBUTES = (() => {
  const base = { a: ['href', 'target', 'rel', 'title', 'class', 'id', 'style'] };
  const img = ['src', 'alt', 'title', 'width', 'height', 'loading', 'class', 'style'];
  const td = ['colspan', 'rowspan', 'class', 'style'];
  const th = ['colspan', 'rowspan', 'scope', 'class', 'style'];
  const styleTag = ['type', 'media'];
  base.svg = [
    'class',
    'id',
    'style',
    'viewBox',
    'viewbox',
    'xmlns',
    'width',
    'height',
    'role',
    'aria-hidden',
    'preserveAspectRatio',
    'fill',
    'stroke',
  ];
  base.g = ['class', 'id', 'style', 'transform'];
  base.line = [
    'class',
    'id',
    'style',
    'x1',
    'y1',
    'x2',
    'y2',
    'stroke',
    'stroke-width',
    'stroke-dasharray',
    'stroke-linecap',
    'transform',
  ];
  base.path = ['class', 'id', 'style', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'fill-rule'];
  base.circle = ['class', 'id', 'style', 'cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'];
  base.text = ['class', 'id', 'style', 'x', 'y', 'fill', 'font-size', 'text-anchor', 'dominant-baseline'];
  base.tspan = ['class', 'id', 'style', 'x', 'y'];
  base.defs = ['class', 'id'];
  base.title = ['class', 'id'];
  base.desc = ['class', 'id'];
  for (const t of LAYOUT_TAG_NAMES) {
    if (!base[t]) {
      if (t === 'img') base[t] = img;
      else if (t === 'td') base[t] = td;
      else if (t === 'th') base[t] = th;
      else if (t === 'pre' || t === 'code') base[t] = ['class', 'style'];
      else if (t === 'style') base[t] = styleTag;
      else base[t] = ['class', 'id', 'style'];
    }
  }
  return base;
})();

const LAYOUT_HTML = {
  allowedTags: LAYOUT_TAG_NAMES,
  allowVulnerableTags: true,
  parseStyleAttributes: true,
  allowedStyles: LAYOUT_ALLOWED_STYLES,
  allowedAttributes: LAYOUT_ALLOWED_ATTRIBUTES,
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowProtocolRelative: true,
  transformTags: {
    '*': (tagName, attribs) => {
      if (attribs.id && !/^[a-zA-Z][a-zA-Z0-9_-]{0,80}$/.test(String(attribs.id))) {
        delete attribs.id;
      }
      if (attribs.target === '_blank' && !attribs.rel) {
        attribs.rel = 'noopener noreferrer';
      }
      return { tagName, attribs };
    },
  },
};

function sanitizeRichHtml(input) {
  if (input == null) return '';
  const s = String(input);
  return sanitizeHtml(s, RICH_HTML);
}

/**
 * Full HTML uploads often put CSS in <head><style>. We keep <body> markup but prepend
 * those styles so they are not lost before sanitization.
 */
function stripHtmlDocumentWrapper(input) {
  const s = String(input).trim();
  let headStyles = '';
  const headMatch = s.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const head = headMatch[1];
    const styleBlocks = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    headStyles = styleBlocks.map((m) => m[1].trim()).filter(Boolean).join('\n');
  }
  const bodyMatch = s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1].trim() : s;
  if (headStyles) {
    body = `<style>\n${headStyles}\n</style>\n${body}`;
  }
  return body;
}

/** Strip risky patterns from embedded <style> content (after sanitize-html keeps the tag). */
function sanitizeEmbeddedStyleCss(css) {
  return String(css)
    .replace(/@import[\s\S]*?;/gi, '/* @import removed */')
    .replace(/expression\s*\(/gi, '/*expression*/(')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/-moz-binding/gi, 'blocked-binding')
    .replace(/behavior\s*:/gi, 'blocked:');
}

/**
 * Broader allow-list for “HTML source” / uploaded .html articles (layout + article-guide classes).
 * Preserves <style> blocks and inline style="..." where allowed by allowedStyles.
 */
function sanitizeLayoutHtml(input) {
  if (input == null) return '';
  let inner = stripHtmlDocumentWrapper(input);
  inner = sanitizeHtml(inner, LAYOUT_HTML);
  inner = inner.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (full, body) => {
    return `<style>${sanitizeEmbeddedStyleCss(body)}</style>`;
  });
  return inner;
}

const MAX_MDX_CHARS = 1_500_000;

function sanitizeMdxSource(input) {
  if (input == null) return '';
  const s = String(input);
  if (s.length > MAX_MDX_CHARS) {
    throw new Error('MDX content exceeds maximum size');
  }
  return s;
}

function sanitizeArticleBody(content, contentFormat) {
  const raw = content != null ? String(content) : '';
  if (contentFormat === 'html') return sanitizeLayoutHtml(raw);
  if (contentFormat === 'mdx') return sanitizeMdxSource(raw);
  return sanitizeRichHtml(raw);
}

module.exports = {
  sanitizeRichHtml,
  sanitizeLayoutHtml,
  sanitizeArticleBody,
  sanitizeMdxSource,
  stripHtmlDocumentWrapper,
  RICH_HTML,
  LAYOUT_HTML,
  MAX_MDX_CHARS,
};
