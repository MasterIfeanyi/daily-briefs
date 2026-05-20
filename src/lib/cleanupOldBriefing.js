// lib/cleanupOldBriefing.js
import BriefingCache from "@/models/BriefingCache";

export async function cleanupOldBriefing(today) {
  await BriefingCache.deleteMany({
    date: { $ne: today }
  });
}