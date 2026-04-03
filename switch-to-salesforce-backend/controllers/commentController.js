const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

async function createComment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { postId, name, email, comment } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const doc = await Comment.create({
      postId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      comment: comment.trim(),
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

module.exports = { createComment };
