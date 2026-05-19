import mongoose from 'mongoose';

const UserConfigSchema = new mongoose.Schema({
  city: {
    type: String,
    default: 'Lagos',
  },
  coordinates: {
    lat: { type: Number, default: 6.5244 },
    lon: { type: Number, default: 3.3792 },
  },
  timezone: {
    type: String,
    default: 'Africa/Lagos',
  },
  stocks: {
    us: {
      type: [String],
      default: ['AAPL', 'TSLA', 'NVDA', 'MSFT'],
    },
    world: {
      type: [String],
      default: ['NESN.SW', 'SONY.T', 'SAP.DE'],
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.UserConfig ||
  mongoose.model('UserConfig', UserConfigSchema);