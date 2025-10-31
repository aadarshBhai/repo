import mongoose from 'mongoose';

const { Schema } = mongoose;

const ConsentSchema = new Schema({
  name: { type: String, required: true },
  given: { type: Boolean, default: false },
  relation: String,
  fileUrl: String,
});

const ApprovedContentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['text', 'audio', 'video', 'image'], required: true },
    contentUrl: { type: String },
    text: { type: String },
    category: { type: String, required: true },
    tribe: { type: String },
    village: { type: String },
    state: { type: String },
    country: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending' 
    },
    consent: { type: ConsentSchema },
    metadata: {
      originalFilename: String,
      mimeType: String,
      size: Number,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ApprovedContentSchema.index({ status: 1, createdAt: -1 });
ApprovedContentSchema.index({ userId: 1 });

export default mongoose.models.ApprovedContent || mongoose.model('ApprovedContent', ApprovedContentSchema);
