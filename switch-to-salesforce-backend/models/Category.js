const mongoose = require('mongoose');

const SECTIONS = ['tutorials', 'preparation', 'general'];

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    /** Sidebar group: which main topic lists this category under */
    section: {
      type: String,
      enum: SECTIONS,
      default: 'general',
    },
  },
  { timestamps: true }
);

categorySchema.index({ section: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);
