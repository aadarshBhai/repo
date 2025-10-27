// fixOldUploadsToCloudinary.mjs
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

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Match old local URLs
  const localRegex = new RegExp('^(?:/uploads/|https?://(?:localhost|127\\.0\\.0\\.1)(?::\\d+)?/uploads/)', 'i');

  const cursor = Submission.find({
    $or: [
      { contentUrl: { $regex: localRegex } },
      { 'consent.fileUrl': { $regex: localRegex } },
    ],
  }).cursor();

  let total = 0;
  let migrated = 0;

  const uploadLocal = async (url) => {
    if (!url) return null;
    const filename = path.basename(url);
    const localPath = path.join(__dirname, 'uploads', filename);
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️ File missing: ${localPath}`);
      return null;
    }
    const res = await cloudinary.uploader.upload(localPath, {
      resource_type: 'auto',
      folder: 'uploads',
    });
    return res.secure_url;
  };

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    total++;
    const updates = {};

    if (typeof doc.contentUrl === 'string' && localRegex.test(doc.contentUrl)) {
      const url = await uploadLocal(doc.contentUrl);
      if (url) updates.contentUrl = url;
    }

    if (doc.consent && typeof doc.consent.fileUrl === 'string' && localRegex.test(doc.consent.fileUrl)) {
      const url = await uploadLocal(doc.consent.fileUrl);
      if (url) updates['consent.fileUrl'] = url;
    }

    if (Object.keys(updates).length > 0) {
      await Submission.updateOne({ _id: doc._id }, { $set: updates });
      migrated++;
      console.log(`✅ Migrated ${doc._id}`);
    }
  }

  console.log(`\nDone. Processed ${total} docs, migrated ${migrated}.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('❌ Migration error:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
