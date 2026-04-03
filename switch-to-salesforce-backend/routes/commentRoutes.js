const express = require('express');
const { body } = require('express-validator');
const { createComment } = require('../controllers/commentController');

const router = express.Router();

router.post(
  '/',
  [
    body('postId').isMongoId(),
    body('name').trim().notEmpty().isLength({ min: 1, max: 120 }),
    body('email').isEmail().normalizeEmail(),
    body('comment').trim().notEmpty().isLength({ min: 1, max: 5000 }),
  ],
  createComment
);

module.exports = router;
