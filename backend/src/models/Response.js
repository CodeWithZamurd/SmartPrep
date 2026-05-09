import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', index: true },
    answerText: { type: String, default: '' },
    answerAudioUrl: { type: String, default: '' },
    answerVideoUrl: { type: String, default: '' },
    marksObtained: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Response', responseSchema);
