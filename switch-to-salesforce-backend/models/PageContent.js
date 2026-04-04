const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'SidebarTopic', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: String, trim: true }],
    coverImage: { type: String, default: '' },
    author: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

pageContentSchema.index({ topicId: 1 });

module.exports = mongoose.model('PageContent', pageContentSchema);
