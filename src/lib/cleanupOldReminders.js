// lib/cleanupOldReminders.js
import Reminder from "@/models/Reminder";

export async function cleanupOldReminders(today) {
  await Reminder.deleteMany({
    date: { $ne: today }
  });
}