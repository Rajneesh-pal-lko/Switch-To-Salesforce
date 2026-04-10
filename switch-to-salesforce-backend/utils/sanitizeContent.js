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
];

/** class + optional id (validated) for layout-oriented HTML articles */
const LAYOUT_ALLOWED_ATTRIBUTES = (() => {
  const base = { a: ['href', 'target', 'rel', 'title', 'class', 'id'] };
  const img = ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'];
  const td = ['colspan', 'rowspan', 'class'];
  const th = ['colspan', 'rowspan', 'scope', 'class'];
  for (const t of LAYOUT_TAG_NAMES) {
    if (!base[t]) {
      if (t === 'img') base[t] = img;
      else if (t === 'td') base[t] = td;
      else if (t === 'th') base[t] = th;
      else if (t === 'pre' || t === 'code') base[t] = ['class'];
      else base[t] = ['class', 'id'];
    }
  }
  return base;
})();

const LAYOUT_HTML = {
  allowedTags: LAYOUT_TAG_NAMES,
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

/** If pasted/uploaded full HTML document, keep inner body only */
function stripHtmlDocumentWrapper(input) {
  const s = String(input).trim();
  const m = s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1].trim() : s;
}

/**
 * Broader allow-list for “HTML source” / uploaded .html articles (layout + article-guide classes).
 * Still strips script/style/on* and javascript: URLs.
 */
function sanitizeLayoutHtml(input) {
  if (input == null) return '';
  const inner = stripHtmlDocumentWrapper(input);
  return sanitizeHtml(inner, LAYOUT_HTML);
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
