import mongoose from 'mongoose';

const BriefingCacheSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    expires: 86400,
  },
});

export default mongoose.models.BriefingCache || mongoose.model('BriefingCache', BriefingCacheSchema);