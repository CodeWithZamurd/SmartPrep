import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' },
    filePath: { type: String, default: '' },
    format: { type: String, enum: ['pdf', 'json', 'html'], default: 'pdf' },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
