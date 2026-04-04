const { validationResult } = require('express-validator');
const slugify = require('slugify');
const Post = require('../models/Post');
const Category = require('../models/Category');

function estimateReadingTimeMinutes(htmlOrText) {
  const text = String(htmlOrText).replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function buildSeoPayload(post, req) {
  const apiPublic = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
  const frontend = (process.env.FRONTEND_URL || apiPublic).replace(/\/$/, '');
  const url = `${frontend}/post.html?slug=${encodeURIComponent(post.slug)}`;
  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription ||
    (post.excerpt && post.excerpt.slice(0, 160)) ||
    String(post.content).replace(/<[^>]+>/g, '').slice(0, 160);
  const image = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${apiPublic.replace(/\/$/, '')}${post.coverImage.startsWith('/') ? '' : '/'}${post.coverImage}`
    : '';
  return {
    meta: {
      title,
      description,
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      ...(image && { image: [{ url: image }] }),
    },
  };
}

function ensureUniquePostSlug(excludeId) {
  async function trySlug(slug, n = 0) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await Post.findOne(q);
    if (!exists) return candidate;
    return trySlug(slug, n + 1);
  }
  return trySlug;
}

function parseTagsField(tags) {
  if (tags == null) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

async function listPosts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
    const category = req.query.category;
    const q = req.query.q;
    const filter = {};
    if (!req.adminList) {
      filter.published = { $ne: false };
    }
    if (category) {
      const cat = await Category.findOne({ slug: String(category).toLowerCase() });
      if (cat) filter.category = cat._id;
    }
    if (q && String(q).trim()) {
      filter.$text = { $search: String(q).trim() };
    }
    const skip = (page - 1) * limit;
    const sort = filter.$text ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
    const findQuery = Post.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    if (filter.$text) {
      findQuery.select({ score: { $meta: 'textScore' } });
    }
    const [items, total] = await Promise.all([findQuery.lean(), Post.countDocuments(filter)]);
    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getPostBySlug(req, res, next) {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .lean();
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.published === false && !req.adminPreview) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const relatedPosts = await Post.find({
      _id: { $ne: post._id },
      category: post.category._id || post.category,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('category', 'name slug')
      .select('title slug excerpt coverImage author createdAt readingTimeMinutes tags')
      .lean();
    const seo = buildSeoPayload(post, req);
    res.json({ success: true, data: post, relatedPosts, seo });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    let {
      title,
      slug,
      content,
      excerpt,
      author,
      category,
      tags,
      metaTitle,
      metaDescription,
      coverImage,
      published,
    } = req.body;

    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    if (!slug) {
      slug = slugify(title, { lower: true, strict: true });
    } else {
      slug = slugify(String(slug), { lower: true, strict: true });
    }
    const getUnique = ensureUniquePostSlug();
    slug = await getUnique(slug);

    const readingTimeMinutes = estimateReadingTimeMinutes(content);

    const post = await Post.create({
      title: title.trim(),
      slug,
      content,
      excerpt: excerpt || '',
      coverImage: coverImage || '',
      author: author.trim(),
      category: cat._id,
      tags: parseTagsField(tags),
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      readingTimeMinutes,
      published: published === false || published === 'false' ? false : true,
    });

    const populated = await Post.findById(post._id).populate('category', 'name slug').lean();
    const seo = buildSeoPayload(populated, req);
    res.status(201).json({ success: true, data: populated, seo });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Post slug already exists' });
    }
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const {
      title,
      slug,
      content,
      excerpt,
      author,
      category,
      tags,
      metaTitle,
      metaDescription,
      published,
    } = req.body;

    if (title != null) post.title = title.trim();
    if (content != null) {
      post.content = content;
      post.readingTimeMinutes = estimateReadingTimeMinutes(content);
    }
    if (excerpt != null) post.excerpt = excerpt;
    if (author != null) post.author = author.trim();
    if (category != null) {
      const cat = await Category.findById(category);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      post.category = cat._id;
    }
    if (tags != null) {
      post.tags = parseTagsField(tags);
    }
    if (metaTitle != null) post.metaTitle = metaTitle;
    if (metaDescription != null) post.metaDescription = metaDescription;
    if (published !== undefined) {
      post.published = published === true || published === 'true';
    }

    if (req.file) {
      post.coverImage = `/uploads/${req.file.filename}`;
    }

    if (slug != null && slug !== post.slug) {
      let newSlug = slugify(String(slug), { lower: true, strict: true });
      const getUnique = ensureUniquePostSlug(post._id);
      newSlug = await getUnique(newSlug);
      post.slug = newSlug;
    }

    await post.save();
    const populated = await Post.findById(post._id).populate('category', 'name slug').lean();
    const seo = buildSeoPayload(populated, req);
    res.json({ success: true, data: populated, seo });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Post slug already exists' });
    }
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
}

async function sitemap(req, res, next) {
  try {
    const publicSite = (
      process.env.FRONTEND_URL ||
      process.env.SITE_URL ||
      `${req.protocol}://${req.get('host')}`
    ).replace(/\/$/, '');
    const posts = await Post.find({ published: { $ne: false } })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .lean();
    const urls = [
      { loc: `${publicSite}/`, changefreq: 'daily', priority: '1.0' },
      ...posts.map((p) => ({
        loc: `${publicSite}/post.html?slug=${encodeURIComponent(p.slug)}`,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
        changefreq: 'weekly',
        priority: '0.8',
      })),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.type('application/xml').send(xml);
  } catch (err) {
    next(err);
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  listPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  sitemap,
};
