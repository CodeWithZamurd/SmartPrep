import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionText: String,
    response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' },
    responseTime: Number,
    confidenceScore: Number,
    difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'] }
  },
  { timestamps: true }
);

export default mongoose.model('QuestionAttempt', attemptSchema);
