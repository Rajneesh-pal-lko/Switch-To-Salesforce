const Post = require('../models/Post');
const Category = require('../models/Category');
const SidebarTopic = require('../models/SidebarTopic');
const PageContent = require('../models/PageContent');

async function dashboardStats(_req, res, next) {
  try {
    const [totalPosts, totalCategories, totalSidebarTopics, totalPages, recentPosts] = await Promise.all([
      Post.countDocuments(),
      Category.countDocuments(),
      SidebarTopic.countDocuments(),
      PageContent.countDocuments(),
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
        totalSidebarTopics,
        totalPages,
        recentPosts,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboardStats };
