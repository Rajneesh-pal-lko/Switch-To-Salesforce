const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 255 },
    comment: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
