import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    domain: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain', required: true, index: true },
    questionText: { type: String, required: true },
    answerText: { type: String, default: '' },
    explanation: { type: String, default: '' },
    difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    category: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
