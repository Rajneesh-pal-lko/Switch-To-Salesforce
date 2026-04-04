const Post = require('../models/Post');
const Category = require('../models/Category');
const SidebarGroup = require('../models/SidebarGroup');
const SidebarTopic = require('../models/SidebarTopic');
const PageContent = require('../models/PageContent');

async function dashboardStats(_req, res, next) {
  try {
    const [
      totalPosts,
      totalCategories,
      groups,
      topics,
      articles,
      draftArticles,
      recentPosts,
    ] = await Promise.all([
      Post.countDocuments(),
      Category.countDocuments(),
      SidebarGroup.countDocuments(),
      SidebarTopic.countDocuments(),
      PageContent.countDocuments(),
      PageContent.countDocuments({ status: 'draft' }),
      Post.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('category', 'name slug')
        .select('title slug author createdAt published')
        .lean(),
    ]);
    res.json({
      success: true,
      data: {
        totalPosts,
        totalCategories,
        /** Doc sidebar groups */
        groups,
        /** Doc sidebar topics */
        topics,
        /** CMS articles (PageContent) */
        articles,
        draftArticles,
        /** @deprecated — use articles */
        totalSidebarTopics: topics,
        /** @deprecated — use articles */
        totalPages: articles,
        recentPosts,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboardStats };
