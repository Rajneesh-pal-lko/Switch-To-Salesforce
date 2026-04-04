const path = require('path');
const env = require('./config/env');
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
const sidebarGroupRoutes = require('./routes/sidebarGroupRoutes');
const sidebarTopicRoutes = require('./routes/sidebarTopicRoutes');
const pageRoutes = require('./routes/pageRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = env.port;

if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (env.frontendUrls.includes(origin)) return callback(null, true);
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
  res.json({
    ok: true,
    service: 'switch-to-salesforce-backend',
    database: env.skipDatabase ? 'skipped' : 'connected',
  });
});

app.get('/sitemap.xml', (req, res, next) => {
  if (env.skipDatabase) {
    return res.status(503).type('text/plain').send('Sitemap unavailable while database is skipped');
  }
  return postController.sitemap(req, res, next);
});

app.use('/api/admin', adminRoutes);
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/sidebar-groups', sidebarGroupRoutes);
app.use('/api/sidebar-topics', sidebarTopicRoutes);
app.use('/api/pages', pageRoutes);

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

function listen() {
  app.listen(PORT, () => {
    console.log(`Switch To Salesforce API listening on http://localhost:${PORT}`);
    if (env.skipDatabase) {
      console.log('Database: skipped (SKIP_DB or empty MONGODB_URI) — API routes that need data will error until you connect MongoDB.');
    }
  });
}

if (env.skipDatabase) {
  listen();
} else {
  connectDB()
    .then(() => {
      listen();
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      process.exit(1);
    });
}
