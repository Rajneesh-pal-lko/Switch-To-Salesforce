const mongoose = require('mongoose');

const sidebarTopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'SidebarGroup', required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

sidebarTopicSchema.index({ groupId: 1, order: 1 });

module.exports = mongoose.model('SidebarTopic', sidebarTopicSchema);
