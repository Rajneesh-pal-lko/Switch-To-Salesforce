const mongoose = require('mongoose');

const sidebarGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    /** URL segment for routes like /:groupSlug/:topicSlug — generated from name on create */
    slug: { type: String, lowercase: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

sidebarGroupSchema.index({ order: 1 });
sidebarGroupSchema.index({ slug: 1 });

module.exports = mongoose.model('SidebarGroup', sidebarGroupSchema);
