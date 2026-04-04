const { validationResult } = require('express-validator');
const slugify = require('slugify');
const SidebarGroup = require('../models/SidebarGroup');
const SidebarTopic = require('../models/SidebarTopic');

/** Stable slug for API URLs; persisted slug preferred, else derived from name */
function groupSlugOf(doc) {
  if (doc && doc.slug && String(doc.slug).trim()) {
    return String(doc.slug).toLowerCase().trim();
  }
  return slugify(String((doc && doc.name) || 'group'), { lower: true, strict: true });
}

async function ensureUniqueGroupSlug(base, excludeId) {
  let candidate = base;
  let n = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await SidebarGroup.findOne(q);
    if (!exists) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

async function listGroups(_req, res, next) {
  try {
    const items = await SidebarGroup.find().sort({ order: 1, name: 1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

async function sidebarTree(_req, res, next) {
  try {
    const groups = await SidebarGroup.find().sort({ order: 1, name: 1 }).lean();
    const topics = await SidebarTopic.find().sort({ order: 1, name: 1 }).lean();
    const byGroup = {};
    topics.forEach((t) => {
      const gid = String(t.groupId);
      if (!byGroup[gid]) byGroup[gid] = [];
      byGroup[gid].push(t);
    });
    const data = groups.map((g) => ({
      ...g,
      topics: byGroup[String(g._id)] || [],
    }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createGroup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, order } = req.body;
    const nameTrim = String(name).trim();
    let slug = req.body.slug != null && String(req.body.slug).trim()
      ? slugify(String(req.body.slug).trim(), { lower: true, strict: true })
      : slugify(nameTrim, { lower: true, strict: true });
    slug = await ensureUniqueGroupSlug(slug);
    const doc = await SidebarGroup.create({
      name: nameTrim,
      slug,
      order: order != null ? Number(order) : 0,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

async function updateGroup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const doc = await SidebarGroup.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (req.body.name != null) doc.name = String(req.body.name).trim();
    if (req.body.order != null) doc.order = Number(req.body.order);
    if (req.body.slug != null && String(req.body.slug).trim()) {
      doc.slug = await ensureUniqueGroupSlug(
        slugify(String(req.body.slug).trim(), { lower: true, strict: true }),
        doc._id
      );
    }
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

async function deleteGroup(req, res, next) {
  try {
    const doc = await SidebarGroup.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    await SidebarTopic.deleteMany({ groupId: doc._id });
    await SidebarGroup.deleteOne({ _id: doc._id });
    res.json({ success: true, message: 'Group and its topics removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listGroups,
  sidebarTree,
  createGroup,
  updateGroup,
  deleteGroup,
  groupSlugOf,
};
