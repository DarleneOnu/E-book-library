const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.static(path.join(__dirname, 'public')));

// Store files on disk using multer
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    // Keep original name but normalize and prevent path separators
    const original = file.originalname || 'upload';
    const safeBase = path.basename(original).replace(/[\\/]/g, '_');
    cb(null, safeBase);
  }
});

const upload = multer({ storage });

app.get('/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, { withFileTypes: true }, (err, entries) => {
    if (err) return res.status(500).json({ error: 'Failed to list files' });

    const files = entries
      .filter(e => e.isFile())
      .map(e => {
        const full = path.join(UPLOAD_DIR, e.name);
        const stat = fs.statSync(full);
        return {
          name: e.name,
          size: stat.size,
          mtimeMs: stat.mtimeMs
        };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    res.json({ files });
  });
});

app.post('/upload', upload.single('ebook'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ ok: true, file: { name: req.file.filename, size: req.file.size } });
});

function sanitizeDownloadName(name) {
  const base = path.basename(name);
  // Prevent weird characters from breaking things; allow most unicode but strip separators
  return base.replace(/[\\/]/g, '_');
}

app.get('/download/:filename', (req, res) => {
  const filename = sanitizeDownloadName(req.params.filename);
  const fullPath = path.join(UPLOAD_DIR, filename);

  // Ensure the file exists and is within UPLOAD_DIR
  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('File not found');
  }

  res.download(fullPath, filename, err => {
    if (err) {
      // Headers may already be sent; just log
      console.error('Download error:', err);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Ebook library running at http://localhost:${PORT}`);
});

