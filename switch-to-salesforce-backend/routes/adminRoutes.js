const express = require('express');
const { body } = require('express-validator');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { param, validationResult } = require('express-validator');
const { login } = require('../controllers/authController');
const { dashboardStats } = require('../controllers/adminController');
const { listPosts, getPostBySlug } = require('../controllers/postController');
const { getPageById } = require('../controllers/pageContentController');
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

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const e = validationResult(req);
  if (!e.isEmpty()) {
    return res.status(400).json({ success: false, errors: e.array() });
  }
  next();
}

function markAdminList(req, res, next) {
  req.adminList = true;
  next();
}

function markAdminPreview(req, res, next) {
  req.adminPreview = true;
  next();
}

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().trim().isLength({ min: 6 }),
  ],
  login
);

router.get('/stats', authMiddleware, requireAdmin, dashboardStats);

router.get('/pages/:id', authMiddleware, requireAdmin, param('id').isMongoId(), handleValidationErrors, getPageById);

router.get('/posts', authMiddleware, requireAdmin, markAdminList, listPosts);
router.get('/posts/:slug', authMiddleware, requireAdmin, markAdminPreview, getPostBySlug);

router.post(
  '/media',
  authMiddleware,
  requireAdmin,
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      url,
      absoluteUrl: `${req.protocol}://${req.get('host')}${url}`,
    });
  }
);

module.exports = router;
