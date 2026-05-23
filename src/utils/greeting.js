// utils/greeting.js

export function getGreeting(timezone) {
  try {
    const tz = timezone || 'UTC';
    const hour = parseInt(
      new Date().toLocaleString('en-US', {
        timeZone: tz,
        hour: 'numeric',
        hour12: false,
      }),
      10
    );

    if (hour < 12) return "Good morning.";
    if (hour < 17) return "Good afternoon.";
    return "Good evening.";
  } catch {
    // If the timezone string is invalid, fall back to device time
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning.";
    if (hour < 17) return "Good afternoon.";
    return "Good evening.";
  }
}