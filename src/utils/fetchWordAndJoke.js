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
    const randomWordRes = await fetch(
      'https://api.api-ninjas.com/v1/randomword',
      { headers: { 'X-Api-Key': process.env.API_NINJAS_KEY } }
    );
    const randomWordData = await randomWordRes.json();
    const word = randomWordData.word;

    if (!word) throw new Error('No word returned from API Ninjas');

    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const dictData = await dictRes.json();
    const entry = Array.isArray(dictData) ? dictData[0] : null;
    const meaning = entry?.meanings?.[0];
    const definition = meaning?.definitions?.[0];

    if (entry && definition) {
      wordOfTheDay = {
        word: entry.word,
        partOfSpeech: meaning.partOfSpeech || 'noun',
        definition: definition.definition,
        usedInSentence: definition.example || null,
        origin: entry.origin || null,
      };
    } else {
      throw new Error(`Dictionary had no entry for: ${word}`);
    }
  } catch (err) {
    console.error('Word fetch failed:', err.message);
  }

  return { wordOfTheDay, joke };
}