/**
 * Server-side MDX → HTML for CMS articles (static frontend has no MDX runtime).
 */
const path = require('path');
const { pathToFileURL } = require('url');
const matter = require('gray-matter');
const { remarkApexAsJava } = require('./remarkApexAsJava.cjs');
const rehypeHeadingIds = require('./rehypeHeadingIds.cjs');

const MAX_MDX_CHARS = 1_500_000;

async function renderMdxToHtml(source) {
  const raw = String(source);
  if (raw.length > MAX_MDX_CHARS) {
    throw new Error('MDX content exceeds maximum size');
  }
  const { content: mdxBody } = matter(raw);
  if (!String(mdxBody).trim()) {
    return '<p class="muted">Empty MDX.</p>';
  }

  const { compile, run } = await import('@mdx-js/mdx');
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');
  const runtime = await import('react/jsx-runtime');
  const remarkGfm = (await import('remark-gfm')).default;
  const rehypePrettyCode = (await import('rehype-pretty-code')).default;

  const code = await compile(mdxBody, {
    development: false,
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm, remarkApexAsJava],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: 'github-dark',
          keepBackground: false,
        },
      ],
      rehypeHeadingIds,
    ],
  });

  const { default: MDXContent } = await run(code, {
    Fragment: runtime.Fragment,
    jsx: runtime.jsx,
    jsxs: runtime.jsxs,
    baseUrl: pathToFileURL(path.join(__dirname, 'virtual.mdx')).href,
  });

  const inner = renderToString(React.createElement(MDXContent));
  return inner;
}

module.exports = { renderMdxToHtml, MAX_MDX_CHARS };
