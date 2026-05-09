import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    technicalScore: Number,
    voiceScore: Number,
    bodyLanguageScore: Number,
    toneConfidence: Number,
    communicationScore: Number,
    overallScore: Number,
    suggestion: String
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
