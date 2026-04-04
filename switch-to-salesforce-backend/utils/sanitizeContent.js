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

function sanitizeRichHtml(input) {
  if (input == null) return '';
  const s = String(input);
  return sanitizeHtml(s, RICH_HTML);
}

module.exports = { sanitizeRichHtml, RICH_HTML };
