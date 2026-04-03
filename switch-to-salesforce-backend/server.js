require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const postController = require('./controllers/postController');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const commentRoutes = require('./routes/commentRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:5500')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (frontendUrls.includes(origin)) return callback(null, true);
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'switch-to-salesforce-backend' });
});

app.get('/sitemap.xml', postController.sitemap);

app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscribe', subscribeRoutes);

app.use((err, _req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message || 'Upload error' });
  }
  next(err);
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Switch To Salesforce API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
