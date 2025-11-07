// fixUrls.mjs
import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

// Configure environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'repo'; // Your database name

async function main() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const submissions = db.collection('submissions');
    
    // Find all submissions with file URLs
    const cursor = submissions.find({
      $or: [
        { contentUrl: { $exists: true, $ne: null } },
        { 'consent.fileUrl': { $exists: true, $ne: null } }
      ]
    });

    let count = 0;
    
    // Process each submission
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      console.log(`\nProcessing submission: ${doc._id}`);
      let needsUpdate = false;
      const update = {};

      // Process contentUrl
      if (doc.contentUrl && !doc.contentUrl.includes('res.cloudinary.com')) {
        console.log(`Processing contentUrl: ${doc.contentUrl}`);
        const filename = doc.contentUrl.split('/').pop();
        const ext = filename?.split('.').pop()?.toLowerCase() || '';
        const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);
        const isPdf = ext === 'pdf';
        const resourceType = isVideo ? 'video' : (isPdf ? 'raw' : 'image');
        const publicId = filename.split('.')[0];
        
        if (publicId) {
          console.log(`Checking Cloudinary for: ${publicId} (${resourceType})`);
          try {
            const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
            if (result.secure_url) {
              console.log(`Found: ${result.secure_url}`);
              update.contentUrl = result.secure_url;
              needsUpdate = true;
            }
          } catch (error) {
            console.log(`Not found in Cloudinary: ${publicId}`);
          }
        }
      }

      // Process consent.fileUrl
      if (doc.consent?.fileUrl && !doc.consent.fileUrl.includes('res.cloudinary.com')) {
        console.log(`Processing consent.fileUrl: ${doc.consent.fileUrl}`);
        const filename = doc.consent.fileUrl.split('/').pop();
        const ext = filename?.split('.').pop()?.toLowerCase() || '';
        const isPdf = ext === 'pdf';
        const resourceType = isPdf ? 'raw' : 'image';
        const publicId = filename.split('.')[0];
        
        if (publicId) {
          console.log(`Checking Cloudinary for: ${publicId} (${resourceType})`);
          try {
            const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
            if (result.secure_url) {
              console.log(`Found: ${result.secure_url}`);
              if (!update.$set) update.$set = {};
              update.$set['consent.fileUrl'] = result.secure_url;
              needsUpdate = true;
            }
          } catch (error) {
            console.log(`Not found in Cloudinary: ${publicId}`);
          }
        }
      }

      // Update the document if needed
      if (needsUpdate) {
        await submissions.updateOne({ _id: doc._id }, { $set: update.$set || update });
        console.log(`Updated submission: ${doc._id}`);
        count++;
      }
    }

    console.log(`\nFinished processing. Updated ${count} submissions.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);