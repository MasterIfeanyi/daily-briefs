import mongoose from 'mongoose';


const BriefingCacheSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

BriefingCacheSchema.index({ sessionId: 1, date: 1 }, { unique: true });

export default mongoose.models.BriefingCache || mongoose.model('BriefingCache', BriefingCacheSchema);