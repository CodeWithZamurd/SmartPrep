import mongoose from 'mongoose';

const aiSettingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    difficultyMin: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    difficultyMax: { type: String, enum: ['easy', 'medium', 'hard'], default: 'hard' },
    followUpFrequency: { type: Number, default: 0.3 },
    weights: {
      technical: { type: Number, default: 0.6 },
      voice: { type: Number, default: 0.2 },
      bodyLanguage: { type: Number, default: 0.2 }
    },
    feedbackStrictness: { type: Number, default: 70, min: 0, max: 100 },
    technicalQuestionsLimit: { type: Number, default: 15, min: 1, max: 30 },
    sessionTimeoutMinutes: { type: Number, default: 30, min: 5, max: 60 },
    twoFactorEnabled: { type: Boolean, default: false },
    lastBackupAt: { type: Date, default: null },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('AISetting', aiSettingSchema);
