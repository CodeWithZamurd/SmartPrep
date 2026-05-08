import mongoose from 'mongoose';

const turnSchema = new mongoose.Schema(
  {
    questionIndex: Number,
    question: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    transcript: String,
    technicalScore: Number,
    clarityScore: Number,
    confidenceScore: Number,
    suggestion: String,
    eyeContactPct: Number
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain: { type: String, enum: ['software', 'ai_ds'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    targetQuestions: { type: Number, default: 5 },
    turns: { type: [turnSchema], default: [] },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    overallTechnical: Number,
    overallClarity: Number,
    overallConfidence: Number,
    summary: String,
    tips: [String]
  },
  { timestamps: true }
);

export default mongoose.model('InterviewSession', sessionSchema);
