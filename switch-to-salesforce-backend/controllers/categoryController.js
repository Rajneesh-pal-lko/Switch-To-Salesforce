const { validationResult } = require('express-validator');
const slugify = require('slugify');
const Category = require('../models/Category');

function ensureUniqueSlug(excludeId) {
  async function trySlug(slug, n = 0) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await Category.findOne(q);
    if (!exists) return candidate;
    return trySlug(slug, n + 1);
  }
  return trySlug;
}

async function listCategories(req, res, next) {
  try {
    const { section } = req.query;
    const q = {};
    if (section && ['tutorials', 'preparation', 'general'].includes(String(section))) {
      q.section = section;
    }
    const categories = await Category.find(q).sort({ name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    let { name, slug, section } = req.body;
    name = name.trim();
    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    } else {
      slug = slugify(String(slug), { lower: true, strict: true });
    }
    const getUnique = ensureUniqueSlug();
    slug = await getUnique(slug);
    const allowed = ['tutorials', 'preparation', 'general'];
    const sec = allowed.includes(String(section || '').toLowerCase()) ? String(section).toLowerCase() : 'general';
    const category = await Category.create({ name, slug, section: sec });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category slug already exists' });
    }
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const doc = await Category.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const { name, slug, section } = req.body;
    if (name != null) doc.name = String(name).trim();
    if (section != null) {
      const allowed = ['tutorials', 'preparation', 'general'];
      doc.section = allowed.includes(String(section).toLowerCase()) ? String(section).toLowerCase() : doc.section;
    }
    if (slug != null && String(slug).trim()) {
      doc.slug = slugify(String(slug), { lower: true, strict: true });
    }
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category slug already exists' });
    }
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const Post = require('../models/Post');
    const PageContent = require('../models/PageContent');
    const doc = await Category.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const [postCount, pageCount] = await Promise.all([
      Post.countDocuments({ category: doc._id }),
      PageContent.countDocuments({ category: doc._id }),
    ]);
    if (postCount > 0 || pageCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category is in use by posts or pages; reassign or remove them first',
      });
    }
    await Category.deleteOne({ _id: doc._id });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
