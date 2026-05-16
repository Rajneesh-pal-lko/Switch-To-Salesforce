const mongoose = require('mongoose');

const sidebarTopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'SidebarGroup', required: true },
    order: { type: Number, default: 0 },
    description: { type: String, default: '', trim: true },
    /** When false the topic is hidden from GET /api/sidebar (public site) but still visible in admin */
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sidebarTopicSchema.index({ groupId: 1, order: 1 });

module.exports = mongoose.model('SidebarTopic', sidebarTopicSchema);
