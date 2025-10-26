import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // optional fields to associate with a user in future
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tribe: { type: String, index: true },
    type: {
      type: String,
      enum: ['text', 'audio', 'video', 'image'],
      default: 'text',
      index: true,
    },
    category: { type: String, index: true }, // e.g., 'folktales', 'folksongs', etc.
    contentUrl: { type: String }, // for audio/video URLs
    text: { type: String }, // full text content if type === 'text'
    consent: {
      given: { type: Boolean, required: true },
      name: { type: String, required: true, trim: true },
      relation: { type: String, trim: true },
      fileUrl: { type: String }, // uploaded consent document or proof
      collectedAt: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', SubmissionSchema);
