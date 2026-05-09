import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Domain', domainSchema);
