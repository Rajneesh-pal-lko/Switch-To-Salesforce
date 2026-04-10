const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '', trim: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'SidebarTopic', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: String, trim: true }],
    coverImage: { type: String, default: '' },
    author: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    order: { type: Number, default: 0 },
    /** rich = TinyMCE subset; html = broader layout HTML (paste / .html upload) */
    contentFormat: {
      type: String,
      enum: ['rich', 'html'],
      default: 'rich',
    },
  },
  { timestamps: true }
);

pageContentSchema.index({ topicId: 1 });
pageContentSchema.index({ topicId: 1, order: 1 });
pageContentSchema.index({ status: 1 });

module.exports = mongoose.model('PageContent', pageContentSchema);
