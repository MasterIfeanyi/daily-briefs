import connectDB from './mongodb';
import UserConfig from '@/models/UserConfig';

export async function getConfig(sessionId) {
  await connectDB();

  let config = await UserConfig.findOne({ sessionId });

  if (!config) {
    config = await UserConfig.create({ sessionId });
  }

  return config;
}