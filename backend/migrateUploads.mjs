// migrateUploads.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables safely from backend/.env
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mongoose Upload model
const uploadSchema = new mongoose.Schema({
  filename: String,
  path: String,
  url: String,
  mimetype: String,
});

const Upload = mongoose.model("Upload", uploadSchema);

async function migrateUploads() {
  try {
    if (!process.env.MONGODB_URI)
      throw new Error("MONGODB_URI not set in .env");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const uploads = await Upload.find({});
    console.log(`Found ${uploads.length} uploads`);

    for (const u of uploads) {
      if (u.path && u.path.startsWith("http")) continue; // skip already uploaded

      const localPath = path.join(__dirname, "uploads", path.basename(u.path));
      if (!fs.existsSync(localPath)) {
        console.log(`⚠️ File not found: ${localPath}`);
        continue;
      }

      const result = await cloudinary.v2.uploader.upload(localPath, {
        resource_type: "auto",
        folder: "uploads",
      });

      u.url = result.secure_url;
      u.path = result.secure_url;
      await u.save();

      console.log(`✅ Uploaded: ${u.filename} -> ${result.secure_url}`);
    }

    console.log("🎉 Migration complete");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error migrating uploads:", err);
    try {
      await mongoose.disconnect();
    } catch {}
  }
}

migrateUploads();
