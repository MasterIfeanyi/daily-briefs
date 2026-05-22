async function fetchWordAndJoke() {
  let wordOfTheDay = null;
  let joke = null;

  try {
    const jokeRes = await fetch(
      'https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist&type=twopart'
    );
    const jokeData = await jokeRes.json();
    if (jokeData.setup && jokeData.delivery) {
      joke = {
        setup: jokeData.setup,
        punchline: jokeData.delivery,
      };
    }
  } catch (err) {
    console.error('Joke fetch failed:', err.message);
  }

  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();

    const res = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`,
      {
        headers: {
          'User-Agent': 'DailyBriefingApp/1.0 (contact@dailybriefing.app)',
        },
      }
    );

    const data = await res.json();
    const wotd = data.wotd;

    if (wotd) {
      wordOfTheDay = {
        word: wotd.title,
        partOfSpeech: wotd.part_of_speech || 'word',
        definition: wotd.definitions?.[0]?.definition ||
          wotd.description ||
          'No definition available.',
        usedInSentence: wotd.examples?.[0]?.example || null,
        origin: null,
      };
    }
  } catch (err) {
    console.error('Wikimedia word fetch failed:', err.message);
  }

  return { wordOfTheDay, joke };
}