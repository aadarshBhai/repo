import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './models/Submission.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Check if a file exists in Cloudinary
const checkFileExists = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    return result.secure_url;
  } catch (error) {
    if (error.error.http_code === 404) {
      console.log(`File not found: ${publicId}`);
      return null;
    }
    console.error(`Error checking file ${publicId}:`, error.message);
    return null;
  }
};

// Update submission with correct Cloudinary URL
const updateSubmission = async (submissionId, field, newUrl) => {
  try {
    const update = { [field]: newUrl };
    await Submission.findByIdAndUpdate(submissionId, update);
    console.log(`Updated ${field} for submission ${submissionId}`);
  } catch (error) {
    console.error(`Error updating submission ${submissionId}:`, error.message);
  }
};

// Main function to check and fix file URLs
const checkAndFixFiles = async () => {
  await connectDB();
  
  try {
    // Find all submissions with file URLs
    const submissions = await Submission.find({
      $or: [
        { contentUrl: { $exists: true, $ne: null } },
        { 'consent.fileUrl': { $exists: true, $ne: null } }
      ]
    });

    console.log(`Found ${submissions.length} submissions with file URLs`);

    for (const sub of submissions) {
      console.log(`\nProcessing submission: ${sub._id}`);
      
      // Check contentUrl
      if (sub.contentUrl) {
        const ext = sub.contentUrl.split('.').pop().toLowerCase();
        const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);
        const isPdf = ext === 'pdf';
        const resourceType = isVideo ? 'video' : (isPdf ? 'raw' : 'image');
        
        // Extract public ID (filename without extension)
        const publicId = sub.contentUrl.split('/').pop().split('.')[0];
        
        console.log(`Checking content file: ${publicId} (${resourceType})`);
        const cloudinaryUrl = await checkFileExists(publicId, resourceType);
        
        if (cloudinaryUrl) {
          console.log(`Found content file: ${cloudinaryUrl}`);
          await updateSubmission(sub._id, 'contentUrl', cloudinaryUrl);
        } else {
          console.log(`Content file not found in Cloudinary: ${sub.contentUrl}`);
        }
      }
      
      // Check consent file
      if (sub.consent?.fileUrl) {
        const ext = sub.consent.fileUrl.split('.').pop().toLowerCase();
        const isPdf = ext === 'pdf';
        const resourceType = isPdf ? 'raw' : 'image';
        
        // Extract public ID (filename without extension)
        const publicId = sub.consent.fileUrl.split('/').pop().split('.')[0];
        
        console.log(`Checking consent file: ${publicId} (${resourceType})`);
        const cloudinaryUrl = await checkFileExists(publicId, resourceType);
        
        if (cloudinaryUrl) {
          console.log(`Found consent file: ${cloudinaryUrl}`);
          await updateSubmission(sub._id, 'consent.fileUrl', cloudinaryUrl);
        } else {
          console.log(`Consent file not found in Cloudinary: ${sub.consent.fileUrl}`);
        }
      }
    }
    
    console.log('\nFinished checking all submissions');
    process.exit(0);
  } catch (error) {
    console.error('Error in checkAndFixFiles:', error);
    process.exit(1);
  }
};

// Run the script
checkAndFixFiles();
