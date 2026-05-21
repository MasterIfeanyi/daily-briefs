import mongoose from 'mongoose';

const SharedBriefingSchema = new mongoose.Schema({
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
  },
});

export default mongoose.models.SharedBriefing ||
  mongoose.model('SharedBriefing', SharedBriefingSchema);