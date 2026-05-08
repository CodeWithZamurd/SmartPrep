import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    domainPreference: { type: String, enum: ['software', 'ai_ds'], default: 'software' },
    dailySessionCount: { type: Number, default: 0 },
    dailySessionDate: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
