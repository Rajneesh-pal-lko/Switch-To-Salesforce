const express = require('express');
const { body, param } = require('express-validator');
const {
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} = require('../controllers/sidebarTopicController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listTopics);

router.post(
  '/',
  authMiddleware,
  requireAdmin,
  [
    body('name').trim().notEmpty().isLength({ max: 200 }),
    body('groupId').notEmpty(),
    body('slug').optional().trim(),
    body('order').optional().isNumeric(),
  ],
  createTopic
);

router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  [
    param('id').isMongoId(),
    body('name').optional().trim().notEmpty(),
    body('groupId').optional(),
    body('slug').optional().trim(),
    body('order').optional().isNumeric(),
  ],
  updateTopic
);

router.delete('/:id', authMiddleware, requireAdmin, [param('id').isMongoId()], deleteTopic);

module.exports = router;
