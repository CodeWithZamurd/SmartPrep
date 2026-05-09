import mongoose from 'mongoose';

const turnSchema = new mongoose.Schema(
  {
    questionIndex: Number,
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    question: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    transcript: String,
    technicalScore: Number,
    clarityScore: Number,
    confidenceScore: Number,
    suggestion: String,
    eyeContactPct: Number,
    correct: { type: Boolean, default: null }
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain', required: true },
    domainSlug: { type: String, required: true },
    mode: {
      textInput: { type: Boolean, default: true },
      voiceInput: { type: Boolean, default: true },
      webcam: { type: Boolean, default: false }
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    targetQuestions: { type: Number, default: 15 },
    turns: { type: [turnSchema], default: [] },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    sessionDuration: { type: Number, default: 0 },
    overallTechnical: Number,
    overallVoice: Number,
    overallBodyLanguage: Number,
    overallClarity: Number,
    overallConfidence: Number,
    overallScore: Number,
    voiceMetrics: {
      fillerWords: Number,
      pacing: Number,
      clarity: Number,
      toneConfidence: Number
    },
    bodyMetrics: {
      eyeContact: Number,
      facialSentiment: Number,
      fidgeting: Number,
      posture: Number
    },
    summary: String,
    tips: [String],
    suggestions: {
      technical: String,
      voice: String,
      bodyLanguage: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('InterviewSession', sessionSchema);
