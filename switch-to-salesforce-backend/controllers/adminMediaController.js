const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

async function listMedia(req, res, next) {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json({ success: true, data: [] });
    }
    const names = await fs.promises.readdir(uploadDir);
    const items = (
      await Promise.all(
        names.map(async (f) => {
          if (f.startsWith('.')) return null;
          const fp = path.join(uploadDir, f);
          let st;
          try {
            st = await fs.promises.stat(fp);
          } catch {
            return null;
          }
          if (!st.isFile()) return null;
          return {
            filename: f,
            url: `/uploads/${f}`,
            size: st.size,
            mtime: st.mtime.toISOString(),
          };
        })
      )
    )
      .filter(Boolean)
      .sort((a, b) => new Date(b.mtime) - new Date(a.mtime))
      .slice(0, 100);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMedia };
