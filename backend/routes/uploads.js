import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = express.Router();

// Configure Cloudinary from env with secure connection
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

// File filter to accept common media types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                      'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'), false);
  }
  cb(null, true);
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200MB
    files: 1
  },
  fileFilter
});

// Authentication middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ errors: [{ msg: 'Authentication required' }] });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ 
      errors: [{ msg: 'Server configuration error' }] 
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.user?.id) {
      throw new Error('Invalid token payload');
    }
    req.userId = payload.user.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      errors: [{ msg: 'Invalid or expired token' }] 
    });
  }
}

// Upload to Cloudinary with proper resource type detection
async function uploadToCloudinary(buffer, originalname) {
  return new Promise((resolve, reject) => {
    // Determine resource type from file extension
    const ext = originalname.split('.').pop().toLowerCase();
    let resourceType = 'auto';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      resourceType = 'image';
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
      resourceType = 'video';
    } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
      resourceType = 'video'; // Cloudinary treats audio as video type
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'heritage-repo',
        public_id: `${Date.now()}-${originalname.replace(/\.[^/.]+$/, '')}`,
        overwrite: false,
        unique_filename: true,
        chunk_size: 6000000, // 6MB chunks for large files
        eager: resourceType === 'image' ? [
          { width: 1000, crop: 'limit', quality: 'auto' }
        ] : undefined
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error(`Upload failed: ${error.message}`));
        }
        if (!result) {
          return reject(new Error('No result from Cloudinary'));
        }
        resolve({
          ...result,
          // Ensure secure URL
          secure_url: result.secure_url.replace('http://', 'https://'),
          // For audio files, ensure we have a playable URL
          url: resourceType === 'video' && result.resource_type === 'video' 
            ? result.secure_url.replace(/\.([^.]*)$/, '.mp4').replace('http://', 'https://')
            : result.secure_url.replace('http://', 'https://')
        });
      }
    );

    // Create a readable stream from buffer and pipe to Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null); // End of stream
    bufferStream.pipe(uploadStream);
  });
}

// Handle file upload
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        errors: [{ msg: 'No file was uploaded' }] 
      });
    }

    // Validate Cloudinary config
    const requiredVars = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('Missing Cloudinary config:', missingVars);
      return res.status(500).json({ 
        errors: [{ msg: 'Server configuration error' }] 
      });
    }

    // Process the upload
    const result = await uploadToCloudinary(
      req.file.buffer, 
      req.file.originalname
    );

    if (!result.secure_url) {
      throw new Error('Upload failed: No URL returned from Cloudinary');
    }

    // Return response
    return res.json({
      url: result.secure_url,
      path: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      duration: result.duration
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      errors: [{ 
        msg: error.message || 'Upload failed. Please try again.' 
      }] 
    });
  }
});

// Delete file from Cloudinary
router.delete('/', requireAuth, async (req, res) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ 
        errors: [{ msg: 'Missing public ID' }] 
      });
    }

    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType,
      invalidate: true
    });

    if (result.result !== 'ok') {
      throw new Error(result.result || 'Failed to delete file');
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ 
      errors: [{ 
        msg: error.message || 'Failed to delete file' 
      }] 
    });
  }
});

export default router;
