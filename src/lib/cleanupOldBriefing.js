import SharedBriefing from '@/models/SharedBriefing';

export async function cleanupOldBriefing(today) {
  await SharedBriefing.deleteMany({
    date: { $ne: today }
  });
}