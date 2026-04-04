const { validationResult } = require('express-validator');
const SidebarGroup = require('../models/SidebarGroup');
const SidebarTopic = require('../models/SidebarTopic');

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
    const doc = await SidebarGroup.create({
      name: String(name).trim(),
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
};
