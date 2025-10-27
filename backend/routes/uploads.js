import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage; upload buffer to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
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

// Helper to upload a buffer to Cloudinary via stream
function uploadToCloudinary(fileBuffer, originalname) {
  return new Promise((resolve, reject) => {
    const opts = {
      resource_type: 'auto',
      folder: 'uploads',
      public_id: undefined,
    };
    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
}

// POST /api/uploads - returns { url, path }
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: 'No file uploaded' }] });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ errors: [{ msg: 'Server misconfiguration: Cloudinary env vars not set' }] });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    const secureUrl = result?.secure_url || result?.url;
    if (!secureUrl) throw new Error('Upload failed');

    // Return absolute URL as both url and path so frontend continues to work
    return res.json({ url: secureUrl, path: secureUrl, publicId: result.public_id, resourceType: result.resource_type });
  } catch (e) {
    console.error('Cloudinary upload error:', e);
    return res.status(500).json({ errors: [{ msg: 'Upload failed' }] });
  }
});

export default router;
