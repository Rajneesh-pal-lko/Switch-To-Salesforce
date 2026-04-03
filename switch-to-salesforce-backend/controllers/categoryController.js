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
    const categories = await Category.find().sort({ name: 1 }).lean();
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
    let { name, slug } = req.body;
    name = name.trim();
    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    } else {
      slug = slugify(String(slug), { lower: true, strict: true });
    }
    const getUnique = ensureUniqueSlug();
    slug = await getUnique(slug);
    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category slug already exists' });
    }
    next(err);
  }
}

module.exports = { listCategories, createCategory };
