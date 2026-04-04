const { validationResult } = require('express-validator');
const slugify = require('slugify');
const PageContent = require('../models/PageContent');
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

async function listPages(req, res, next) {
  try {
    const items = await PageContent.find()
      .populate('topicId', 'name slug')
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 })
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

    const doc = await PageContent.create({
      title: title.trim(),
      slug,
      content,
      topicId,
      category: catId,
      tags: parseTagsField(tags),
      coverImage: coverImage || '',
      author: (author && String(author).trim()) || '',
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

    const { title, slug, content, topicId, category, tags, author } = req.body;

    if (title != null) doc.title = String(title).trim();
    if (content != null) doc.content = content;
    if (author != null) doc.author = String(author).trim();
    if (tags != null) doc.tags = parseTagsField(tags);

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
};
