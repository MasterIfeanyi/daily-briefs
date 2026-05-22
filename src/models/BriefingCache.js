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
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  status: {
    type: String,
    enum: ['raw', 'complete'],
    default: 'raw',
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

BriefingCacheSchema.index({ sessionId: 1, date: 1 }, { unique: true });

export default mongoose.models.BriefingCache ||
  mongoose.model('BriefingCache', BriefingCacheSchema);