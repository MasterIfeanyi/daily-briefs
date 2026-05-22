const WORD_LIST = [
  'ephemeral', 'serendipity', 'melancholy', 'eloquent', 'resilience',
  'enigmatic', 'luminous', 'tenacious', 'wanderlust', 'solitude',
  'euphoria', 'labyrinth', 'nostalgia', 'tranquil', 'vivacious',
  'harbinger', 'zenith', 'cascade', 'reverie', 'steadfast',
];

export async function fetchWordAndJoke() {
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
    // Pick a word based on the day of the year so it changes daily
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const word = WORD_LIST[dayOfYear % WORD_LIST.length];

    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      const meaning = entry.meanings?.[0];
      const definition = meaning?.definitions?.[0];

      if (entry.word && definition?.definition) {
        wordOfTheDay = {
          word: entry.word,
          partOfSpeech: meaning?.partOfSpeech || 'word',
          definition: definition.definition,
          usedInSentence: definition.example || null,
          origin: entry.origin || null,
        };
      }
    }
  } catch (err) {
    console.error('Word fetch failed:', err.message);
  }

  return { wordOfTheDay, joke };
}