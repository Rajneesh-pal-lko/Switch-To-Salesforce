const { validationResult } = require('express-validator');
const slugify = require('slugify');
const SidebarGroup = require('../models/SidebarGroup');
const SidebarTopic = require('../models/SidebarTopic');

function ensureUniqueSlug(excludeId) {
  async function trySlug(slug, n = 0) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await SidebarTopic.findOne(q);
    if (!exists) return candidate;
    return trySlug(slug, n + 1);
  }
  return trySlug;
}

async function listTopics(req, res, next) {
  try {
    const { groupId } = req.query;
    const q = {};
    if (groupId) {
      q.groupId = groupId;
    }
    const items = await SidebarTopic.find(q).sort({ order: 1, name: 1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

async function createTopic(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    let { name, slug, groupId, order } = req.body;
    const group = await SidebarGroup.findById(groupId);
    if (!group) {
      return res.status(400).json({ success: false, message: 'Invalid group' });
    }
    name = String(name).trim();
    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    } else {
      slug = slugify(String(slug), { lower: true, strict: true });
    }
    const getUnique = ensureUniqueSlug();
    slug = await getUnique(slug);
    const description = req.body.description != null ? String(req.body.description).trim() : '';

    const doc = await SidebarTopic.create({
      name,
      slug,
      groupId,
      order: order != null ? Number(order) : 0,
      description,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Topic slug already exists' });
    }
    next(err);
  }
}

async function updateTopic(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const doc = await SidebarTopic.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    if (req.body.name != null) doc.name = String(req.body.name).trim();
    if (req.body.groupId != null) {
      const g = await SidebarGroup.findById(req.body.groupId);
      if (!g) {
        return res.status(400).json({ success: false, message: 'Invalid group' });
      }
      doc.groupId = req.body.groupId;
    }
    if (req.body.order != null) doc.order = Number(req.body.order);
    if (req.body.slug != null && String(req.body.slug).trim()) {
      let newSlug = slugify(String(req.body.slug), { lower: true, strict: true });
      const getUnique = ensureUniqueSlug(doc._id);
      newSlug = await getUnique(newSlug);
      doc.slug = newSlug;
    }
    if (req.body.description != null) {
      doc.description = String(req.body.description).trim();
    }
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Topic slug already exists' });
    }
    next(err);
  }
}

async function deleteTopic(req, res, next) {
  try {
    const doc = await SidebarTopic.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    res.json({ success: true, message: 'Topic deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
};
