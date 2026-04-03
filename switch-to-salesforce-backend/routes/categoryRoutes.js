const express = require('express');
const { body } = require('express-validator');
const { listCategories, createCategory } = require('../controllers/categoryController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listCategories);

router.post(
  '/',
  authMiddleware,
  requireAdmin,
  [
    body('name').trim().notEmpty().isLength({ max: 200 }),
    body('slug').optional().trim().isLength({ max: 200 }),
    body('section').optional().isIn(['tutorials', 'preparation', 'general']),
  ],
  createCategory
);

module.exports = router;
