export async function fetchOnThisDay() {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const res = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`,
      {
        headers: {
          'User-Agent': 'DailyBriefingApp/1.0 (contact@dailybriefing.app)',
        },
      }
    );

    const data = await res.json();
    const events = data.events || [];

    const positive = events
      .filter(e => {
        const text = e.text.toLowerCase();
        return !text.includes('killed') &&
          !text.includes('died') &&
          !text.includes('war') &&
          !text.includes('attack') &&
          !text.includes('disaster') &&
          !text.includes('crash') &&
          !text.includes('assassination');
      })
      .slice(0, 3)
      .map(e => ({
        year: e.year,
        text: e.text,
      }));

    return positive.length > 0 ? positive : [
      { year: 1969, text: 'Apollo 11 successfully landed humans on the Moon for the first time.' }
    ];
  } catch (err) {
    console.error('OnThisDay fetch failed:', err);
    return [
      { year: 1969, text: 'Apollo 11 successfully landed humans on the Moon for the first time.' }
    ];
  }
}