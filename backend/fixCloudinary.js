import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
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
    console.log('Connecting to MongoDB...');
    console.log('Using connection string:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Import Submission model after connecting to DB
const getSubmissionModel = async () => {
  try {
    return (await import('./models/Submission.js')).default;
  } catch (error) {
    console.error('Error loading Submission model:', error);
    process.exit(1);
  }
};

// Check if a file exists in Cloudinary
const checkFileExists = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    return result.secure_url;
  } catch (error) {
    if (error.error?.http_code === 404) {
      console.log(`File not found: ${publicId}`);
      return null;
    }
    console.error(`Error checking file ${publicId}:`, error.message);
    return null;
  }
};

// Main function to fix file URLs
const fixFileUrls = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get Submission model
    const Submission = await getSubmissionModel();
    
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
      
      // Process contentUrl
      if (sub.contentUrl && !sub.contentUrl.includes('res.cloudinary.com')) {
        console.log(`Processing contentUrl: ${sub.contentUrl}`);
        const filename = sub.contentUrl.split('/').pop();
        const ext = filename?.split('.').pop()?.toLowerCase() || '';
        const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);
        const isPdf = ext === 'pdf';
        const resourceType = isVideo ? 'video' : (isPdf ? 'raw' : 'image');
        const publicId = filename.split('.')[0];
        
        if (publicId) {
          console.log(`Checking Cloudinary for: ${publicId} (${resourceType})`);
          const cloudinaryUrl = await checkFileExists(publicId, resourceType);
          
          if (cloudinaryUrl) {
            console.log(`Updating to: ${cloudinaryUrl}`);
            sub.contentUrl = cloudinaryUrl;
            await sub.save();
          }
        }
      }
      
      // Process consent.fileUrl
      if (sub.consent?.fileUrl && !sub.consent.fileUrl.includes('res.cloudinary.com')) {
        console.log(`Processing consent.fileUrl: ${sub.consent.fileUrl}`);
        const filename = sub.consent.fileUrl.split('/').pop();
        const ext = filename?.split('.').pop()?.toLowerCase() || '';
        const isPdf = ext === 'pdf';
        const resourceType = isPdf ? 'raw' : 'image';
        const publicId = filename.split('.')[0];
        
        if (publicId) {
          console.log(`Checking Cloudinary for: ${publicId} (${resourceType})`);
          const cloudinaryUrl = await checkFileExists(publicId, resourceType);
          
          if (cloudinaryUrl) {
            console.log(`Updating to: ${cloudinaryUrl}`);
            sub.consent.fileUrl = cloudinaryUrl;
            await sub.save();
          }
        }
      }
    }
    
    console.log('\nFinished processing all submissions');
    process.exit(0);
  } catch (error) {
    console.error('Error in fixFileUrls:', error);
    process.exit(1);
  }
};

// Run the script
fixFileUrls();
