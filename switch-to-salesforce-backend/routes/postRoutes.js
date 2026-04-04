const express = require('express');
const { body, param, query } = require('express-validator');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const {
  listPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Only image uploads are allowed'));
  },
});

function uploadCoverIfMultipart(req, res, next) {
  if (req.is('multipart/form-data')) {
    return upload.single('coverImage')(req, res, next);
  }
  next();
}

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isString(),
    query('q').optional().isString().trim(),
  ],
  listPosts
);

router.get('/:slug', param('slug').trim().notEmpty(), getPostBySlug);

router.post(
  '/',
  authMiddleware,
  requireAdmin,
  uploadCoverIfMultipart,
  [
    body('title').trim().notEmpty().isLength({ max: 300 }),
    body('content').isString().notEmpty(),
    body('author').trim().notEmpty().isLength({ max: 120 }),
    body('category').notEmpty(),
    body('excerpt').optional().isString(),
    body('slug').optional().trim(),
    body('tags').optional(),
    body('metaTitle').optional().trim().isLength({ max: 200 }),
    body('metaDescription').optional().trim().isLength({ max: 500 }),
    body('published').optional().isBoolean(),
  ],
  createPost
);

router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  uploadCoverIfMultipart,
  [
    param('id').isMongoId(),
    body('title').optional().trim().notEmpty(),
    body('content').optional().isString(),
    body('author').optional().trim(),
    body('category').optional(),
    body('excerpt').optional().isString(),
    body('slug').optional().trim(),
    body('tags').optional(),
    body('metaTitle').optional().trim(),
    body('metaDescription').optional().trim(),
    body('published').optional().isBoolean(),
  ],
  updatePost
);

router.delete('/:id', authMiddleware, requireAdmin, deletePost);

module.exports = router;
