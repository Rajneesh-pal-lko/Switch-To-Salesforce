/**
 * Public documentation endpoints: sidebar tree and full-text-style search for the static site.
 */
const env = require('../config/env');
const SidebarGroup = require('../models/SidebarGroup');
const SidebarTopic = require('../models/SidebarTopic');
const Post = require('../models/Post');
const PageContent = require('../models/PageContent');
const { publishedOnlyCondition } = require('./pageContentController');
const { groupSlugOf } = require('./sidebarGroupController');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Fallback when legacy groups have no slug stored */
function groupSlugFromDoc(g) {
  return groupSlugOf(g);
}

/**
 * GET /api/sidebar
 * Returns [{ name, slug, topics: [{ name, slug }] }, ...]
 */
async function getPublicSidebar(req, res, next) {
  if (env.skipDatabase) {
    return res.json({ success: true, data: [] });
  }
  try {
    const groups = await SidebarGroup.find().sort({ order: 1, name: 1 }).lean();
    const topics = await SidebarTopic.find().sort({ order: 1, name: 1 }).lean();
    const byGroup = {};
    topics.forEach((t) => {
      const gid = String(t.groupId);
      if (!byGroup[gid]) byGroup[gid] = [];
      byGroup[gid].push({ name: t.name, slug: t.slug });
    });
    const data = groups.map((g) => ({
      name: g.name,
      slug: groupSlugFromDoc(g),
      topics: byGroup[String(g._id)] || [],
    }));
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/search?q=
 * Returns { groups, topics, articles } for the sidebar search UI.
 * Articles include blog posts (`kind: 'post'`) and CMS pages (`kind: 'page'`).
 */
async function searchSite(req, res, next) {
  if (env.skipDatabase) {
    return res.json({ success: true, data: { groups: [], topics: [], articles: [] } });
  }
  const raw = (req.query.q && String(req.query.q).trim()) || '';
  if (!raw) {
    return res.json({ success: true, data: { groups: [], topics: [], articles: [] } });
  }
  try {
    const re = new RegExp(escapeRegex(raw), 'i');

    const groups = await SidebarGroup.find({ $or: [{ name: re }, { slug: re }] })
      .sort({ order: 1, name: 1 })
      .lean();
    const groupResults = groups.map((g) => ({
      name: g.name,
      slug: groupSlugFromDoc(g),
    }));

    const allGroups = await SidebarGroup.find().sort({ order: 1, name: 1 }).lean();
    const groupById = {};
    allGroups.forEach((g) => {
      groupById[String(g._id)] = g;
    });

    const allTopics = await SidebarTopic.find().sort({ order: 1, name: 1 }).lean();
    const topicResults = [];
    allTopics.forEach((t) => {
      const g = groupById[String(t.groupId)];
      const gslug = g ? groupSlugFromDoc(g) : '';
      const gname = g ? g.name : '';
      const matchTopic = re.test(t.name) || re.test(t.slug);
      const matchGroup =
        g && (re.test(g.name) || (g.slug && re.test(g.slug)) || re.test(gslug));
      if (matchTopic || matchGroup) {
        topicResults.push({
          name: t.name,
          slug: t.slug,
          group: gslug,
        });
      }
    });

    const posts = await Post.find({
      published: { $ne: false },
      $or: [{ title: re }, { excerpt: re }, { content: re }],
    })
      .populate('category', 'name slug')
      .limit(40)
      .lean();

    const catSlugs = [...new Set(posts.map((p) => (p.category && p.category.slug ? p.category.slug : '')).filter(Boolean))];
    const topicsBySlug = {};
    if (catSlugs.length) {
      const topicDocs = await SidebarTopic.find({ slug: { $in: catSlugs } })
        .populate('groupId')
        .lean();
      topicDocs.forEach((t) => {
        topicsBySlug[t.slug] = t;
      });
    }

    const articles = [];
    posts.forEach((p) => {
      const catSlug = p.category && p.category.slug ? p.category.slug : '';
      const t = catSlug ? topicsBySlug[catSlug] : null;
      let groupSlug = '';
      let topicSlug = catSlug;
      if (t && t.groupId) {
        topicSlug = t.slug;
        groupSlug = groupSlugFromDoc(t.groupId);
      }
      articles.push({
        title: p.title,
        slug: p.slug,
        topic: topicSlug,
        group: groupSlug,
        kind: 'post',
      });
    });

    const pages = await PageContent.find({
      $and: [{ $or: [{ title: re }, { slug: re }] }, publishedOnlyCondition()],
    })
      .populate({
        path: 'topicId',
        select: 'name slug groupId',
        populate: { path: 'groupId', select: 'name slug' },
      })
      .limit(40)
      .lean();

    pages.forEach((page) => {
      const t = page.topicId;
      if (!t) return;
      const g = t.groupId;
      articles.push({
        title: page.title,
        slug: page.slug,
        topic: t.slug,
        group: g ? groupSlugFromDoc(g) : '',
        kind: 'page',
      });
    });

    const seen = new Set();
    const articlesDeduped = articles.filter((a) => {
      const k = `${a.kind}:${a.slug}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return res.json({
      success: true,
      data: {
        groups: groupResults,
        topics: topicResults,
        articles: articlesDeduped,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getPublicSidebar,
  searchSite,
};
