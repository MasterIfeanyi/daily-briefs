// utils/fetchOnThisDay.js

export function fetchOnThisDay(timezone) {
  try {
    const tz = timezone || 'UTC';

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(new Date());
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const year = parts.find(p => p.type === 'year')?.value;

    // returning { month: "May", day: 24, year: 2026 }
    return { month, day: parseInt(day, 10), year: parseInt(year, 10) };

  } catch {
    // graceful fallback
    const now = new Date();
    return {
      month: now.toLocaleString('en-US', { month: 'long' }),
      day: now.getDate(),
      year: now.getFullYear(),
    };
  }
}