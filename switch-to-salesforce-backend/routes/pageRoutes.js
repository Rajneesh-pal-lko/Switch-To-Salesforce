const express = require('express');
const { body, param } = require('express-validator');
const {
  listPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
} = require('../controllers/pageContentController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listPages);

router.get('/:slug', [param('slug').trim().notEmpty()], getPageBySlug);

router.post(
  '/',
  authMiddleware,
  requireAdmin,
  [
    body('title').trim().notEmpty().isLength({ max: 300 }),
    body('content').isString().notEmpty(),
    body('topicId').notEmpty(),
    body('slug').optional().trim(),
    body('category').optional(),
    body('tags').optional(),
    body('author').optional().trim().isLength({ max: 120 }),
    body('excerpt').optional().isString().isLength({ max: 2000 }),
    body('status').optional().isIn(['draft', 'published']),
    body('order').optional().isNumeric(),
    body('contentFormat').optional().isIn(['rich', 'html', 'mdx']),
  ],
  createPage
);

router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  [
    param('id').isMongoId(),
    body('title').optional().trim().notEmpty(),
    body('content').optional().isString(),
    body('topicId').optional(),
    body('slug').optional().trim(),
    body('category').optional(),
    body('tags').optional(),
    body('author').optional().trim(),
    body('coverImage').optional().isString(),
    body('excerpt').optional().isString().isLength({ max: 2000 }),
    body('status').optional().isIn(['draft', 'published']),
    body('order').optional().isNumeric(),
    body('contentFormat').optional().isIn(['rich', 'html', 'mdx']),
  ],
  updatePage
);

router.delete('/:id', authMiddleware, requireAdmin, [param('id').isMongoId()], deletePage);

module.exports = router;
