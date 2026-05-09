import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatarUrl: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    domainPreference: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain', default: null },
    bookmarkedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    settings: {
      darkMode: { type: Boolean, default: true },
      learningMode: { type: Boolean, default: false },
      notificationsEnabled: { type: Boolean, default: true }
    },
    dailySessionCount: { type: Number, default: 0 },
    dailySessionDate: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
