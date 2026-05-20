import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);