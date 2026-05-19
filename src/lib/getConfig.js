import connectDB from './mongodb';
import UserConfig from '@/models/UserConfig';

export async function getConfig() {
  await connectDB();

  let config = await UserConfig.findOne();

  if (!config) {
    config = await UserConfig.create({});
  }

  return config;
}