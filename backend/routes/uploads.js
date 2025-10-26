import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const safeBase = path.parse(file.originalname).name.replace(/[^a-z0-9_-]/gi, '_');
    const ext = path.extname(file.originalname) || '';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${safeBase}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

// Require user auth via JWT
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ errors: [{ msg: 'Missing token' }] });

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ errors: [{ msg: 'Server misconfiguration: JWT secret not set' }] });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || !payload.user || !payload.user.id) {
      return res.status(401).json({ errors: [{ msg: 'Invalid token' }] });
    }
    req.userId = payload.user.id;
    next();
  } catch (e) {
    return res.status(401).json({ errors: [{ msg: 'Invalid token' }] });
  }
}

// POST /api/uploads - returns { url }
router.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ errors: [{ msg: 'No file uploaded' }] });
  }
  const relPath = `/uploads/${req.file.filename}`;
  const absUrl = `${req.protocol}://${req.get('host')}${relPath}`;
  return res.json({ url: absUrl, path: relPath });
});

export default router;
