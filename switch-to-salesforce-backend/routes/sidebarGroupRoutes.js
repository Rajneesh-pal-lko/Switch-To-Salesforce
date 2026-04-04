const express = require('express');
const { body, param } = require('express-validator');
const {
  listGroups,
  sidebarTree,
  createGroup,
  updateGroup,
  deleteGroup,
} = require('../controllers/sidebarGroupController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/tree', sidebarTree);
router.get('/', listGroups);

router.post(
  '/',
  authMiddleware,
  requireAdmin,
  [body('name').trim().notEmpty().isLength({ max: 200 }), body('order').optional().isNumeric()],
  createGroup
);

router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  [param('id').isMongoId(), body('name').optional().trim().notEmpty(), body('order').optional().isNumeric()],
  updateGroup
);

router.delete('/:id', authMiddleware, requireAdmin, [param('id').isMongoId()], deleteGroup);

module.exports = router;
