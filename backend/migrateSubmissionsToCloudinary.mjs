// migrateSubmissionsToCloudinary.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import Submission from './models/Submission.js';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env (override any system envs)
dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set in backend/.env`);
  return v;
}

async function main() {
  // Validate envs
  const MONGODB_URI = requireEnv('MONGODB_URI');
  requireEnv('CLOUDINARY_CLOUD_NAME');
  requireEnv('CLOUDINARY_API_KEY');
  requireEnv('CLOUDINARY_API_SECRET');

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Connect to MongoDB
  try {
    const masked = MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    console.log('Connecting to MongoDB URI:', masked);
  } catch {}
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Regex for local uploads URLs
  const localRegex = new RegExp('^(?:/uploads/|https?://(?:localhost|127\\.0\\.0\\.1)(?::\\d+)?/uploads/)');

  // Find documents needing migration
  const cursor = Submission.find({
    $or: [
      { contentUrl: { $regex: localRegex } },
      { 'consent.fileUrl': { $regex: localRegex } },
    ],
  })
    .sort({ createdAt: 1 })
    .cursor();

  let total = 0;
  let migrated = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    total++;
    const updates = {};

    // Helper: upload local file path to Cloudinary
    const uploadLocal = async (u) => {
      if (!u) return null;
      // Normalize to local filesystem path under backend/uploads
      const filename = path.basename(u);
      const localPath = path.join(__dirname, 'uploads', filename);
      if (!fs.existsSync(localPath)) {
        console.warn(`⚠️ File missing on disk: ${localPath}`);
        return null;
      }
      const result = await cloudinary.uploader.upload(localPath, {
        resource_type: 'auto',
        folder: 'uploads',
      });
      return result?.secure_url || result?.url || null;
    };

    // Migrate contentUrl if needed
    if (typeof doc.contentUrl === 'string' && localRegex.test(doc.contentUrl)) {
      try {
        const url = await uploadLocal(doc.contentUrl);
        if (url) updates.contentUrl = url;
      } catch (e) {
        console.error('❌ Failed to upload contentUrl for', doc._id.toString(), e.message);
      }
    }

    // Migrate consent.fileUrl if needed
    if (doc.consent && typeof doc.consent.fileUrl === 'string' && localRegex.test(doc.consent.fileUrl)) {
      try {
        const url = await uploadLocal(doc.consent.fileUrl);
        if (url) updates['consent.fileUrl'] = url;
      } catch (e) {
        console.error('❌ Failed to upload consent.fileUrl for', doc._id.toString(), e.message);
      }
    }

    if (Object.keys(updates).length > 0) {
      await Submission.updateOne({ _id: doc._id }, { $set: updates });
      migrated++;
      console.log(`✅ Migrated ${doc._id.toString()}`);
    }
  }

  console.log(`\nDone. Visited ${total} documents, migrated ${migrated}.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('❌ Migration error:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
