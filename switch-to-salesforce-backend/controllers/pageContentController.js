const { validationResult } = require('express-validator');
const slugify = require('slugify');
const PageContent = require('../models/PageContent');
const { sanitizeArticleBody } = require('../utils/sanitizeContent');
const SidebarTopic = require('../models/SidebarTopic');
const Category = require('../models/Category');

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

function ensureUniqueSlug(excludeId) {
  async function trySlug(slug, n = 0) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await PageContent.findOne(q);
    if (!exists) return candidate;
    return trySlug(slug, n + 1);
  }
  return trySlug;
}

/** Public list only shows published (or legacy docs with no status). Admin full list uses req.adminFullPageList. */
function publishedOnlyCondition() {
  return { $or: [{ status: 'published' }, { status: { $exists: false } }] };
}

async function listPages(req, res, next) {
  try {
    const topicSlug = req.query.topicSlug;
    const parts = [];
    if (topicSlug && String(topicSlug).trim()) {
      const ts = String(topicSlug).toLowerCase().trim();
      const topic = await SidebarTopic.findOne({ slug: ts });
      if (!topic) {
        return res.json({ success: true, data: [] });
      }
      parts.push({ topicId: topic._id });
    }
    if (!req.adminFullPageList) {
      parts.push(publishedOnlyCondition());
    }
    const query = parts.length === 0 ? {} : parts.length === 1 ? parts[0] : { $and: parts };
    const items = await PageContent.find(query)
      .populate('topicId', 'name slug')
      .populate('category', 'name slug')
      .sort({ order: 1, updatedAt: -1 })
      .lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

async function getPageById(req, res, next) {
  try {
    const page = await PageContent.findById(req.params.id)
      .populate('topicId', 'name slug groupId')
      .populate('category', 'name slug')
      .lean();
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

async function getPageBySlug(req, res, next) {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug })
      .populate('topicId', 'name slug groupId')
      .populate('category', 'name slug')
      .lean();
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    const isDraft = page.status === 'draft';
    if (isDraft) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

async function createPage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    let {
      title,
      slug,
      content,
      topicId,
      category,
      tags,
      coverImage,
      author,
      excerpt,
      status,
      order,
      contentFormat,
    } = req.body;

    const topic = await SidebarTopic.findById(topicId);
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Invalid topic' });
    }

    let catId = null;
    if (category) {
      const cat = await Category.findById(category);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      catId = cat._id;
    }

    if (!slug) {
      slug = slugify(title, { lower: true, strict: true });
    } else {
      slug = slugify(String(slug), { lower: true, strict: true });
    }
    const getUnique = ensureUniqueSlug();
    slug = await getUnique(slug);

    let st = status === 'draft' ? 'draft' : 'published';
    const fmt = contentFormat === 'html' ? 'html' : 'rich';
    const doc = await PageContent.create({
      title: title.trim(),
      slug,
      content: sanitizeArticleBody(content, fmt),
      topicId,
      category: catId,
      tags: parseTagsField(tags),
      coverImage: coverImage || '',
      author: (author && String(author).trim()) || '',
      excerpt: excerpt != null ? String(excerpt).trim() : '',
      status: st,
      order: order != null ? Number(order) || 0 : 0,
      contentFormat: fmt,
    });

    const populated = await PageContent.findById(doc._id)
      .populate('topicId', 'name slug')
      .populate('category', 'name slug')
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Page slug already exists' });
    }
    next(err);
  }
}

async function updatePage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const doc = await PageContent.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const {
      title,
      slug,
      content,
      topicId,
      category,
      tags,
      author,
      excerpt,
      status,
      order,
      contentFormat,
    } = req.body;

    if (title != null) doc.title = String(title).trim();
    const fmt =
      contentFormat === 'html' ? 'html' : contentFormat === 'rich' ? 'rich' : doc.contentFormat || 'rich';
    if (contentFormat != null) {
      doc.contentFormat = fmt;
    }
    if (content != null) {
      doc.content = sanitizeArticleBody(content, doc.contentFormat || 'rich');
    } else if (contentFormat != null) {
      doc.content = sanitizeArticleBody(doc.content, doc.contentFormat || 'rich');
    }
    if (author != null) doc.author = String(author).trim();
    if (tags != null) doc.tags = parseTagsField(tags);
    if (excerpt != null) doc.excerpt = String(excerpt).trim();
    if (status === 'draft' || status === 'published') doc.status = status;
    if (order != null) doc.order = Number(order) || 0;

    if (req.body.coverImage != null) {
      doc.coverImage = String(req.body.coverImage);
    }

    if (topicId != null) {
      const topic = await SidebarTopic.findById(topicId);
      if (!topic) {
        return res.status(400).json({ success: false, message: 'Invalid topic' });
      }
      doc.topicId = topicId;
    }

    if (category !== undefined) {
      if (!category) {
        doc.category = null;
      } else {
        const cat = await Category.findById(category);
        if (!cat) {
          return res.status(400).json({ success: false, message: 'Invalid category' });
        }
        doc.category = cat._id;
      }
    }

    if (slug != null && String(slug).trim()) {
      let newSlug = slugify(String(slug), { lower: true, strict: true });
      const getUnique = ensureUniqueSlug(doc._id);
      newSlug = await getUnique(newSlug);
      doc.slug = newSlug;
    }

    await doc.save();
    const populated = await PageContent.findById(doc._id)
      .populate('topicId', 'name slug')
      .populate('category', 'name slug')
      .lean();
    res.json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Page slug already exists' });
    }
    next(err);
  }
}

async function deletePage(req, res, next) {
  try {
    const doc = await PageContent.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  publishedOnlyCondition,
};
