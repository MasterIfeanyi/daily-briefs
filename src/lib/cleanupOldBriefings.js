import BriefingCache from '@/models/BriefingCache';

export async function cleanupOldBriefings(today, sessionId) {
  await BriefingCache.deleteMany({
    sessionId,
    date: { $ne: today },
  });
}