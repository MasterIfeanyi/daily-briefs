export async function fetchWordAndJoke() {
  try {
    const [jokeRes] = await Promise.all([
      fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist&type=twopart'),
    ]);

    const jokeData = await jokeRes.json();

    const wordRes = await fetch('https://random-word-api.vercel.app/api?words=1');
    const wordArray = await wordRes.json();
    const word = wordArray[0] || 'serendipity';

    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const dictData = await dictRes.json();

    const entry = Array.isArray(dictData) ? dictData[0] : null;
    const meaning = entry?.meanings?.[0];
    const definition = meaning?.definitions?.[0];

    return {
      wordOfTheDay: {
        word: entry?.word || word,
        partOfSpeech: meaning?.partOfSpeech || 'noun',
        definition: definition?.definition || 'A wonderful and unexpected discovery.',
        usedInSentence: definition?.example || `The word ${word} captures something truly unique.`,
        origin: entry?.origin || 'Origin unknown.',
      },
      joke: {
        setup: jokeData.setup || 'Why do programmers prefer dark mode?',
        punchline: jokeData.delivery || 'Because light attracts bugs.',
      },
    };
  } catch (err) {
    console.error('Word/Joke fetch failed:', err.message);
    return {
      wordOfTheDay: {
        word: 'Serendipity',
        partOfSpeech: 'noun',
        definition: 'The occurrence of events by chance in a happy or beneficial way.',
        usedInSentence: 'It was pure serendipity that they met that day.',
        origin: 'From the Persian fairy tale "The Three Princes of Serendip".',
      },
      joke: {
        setup: 'Why do programmers prefer dark mode?',
        punchline: 'Because light attracts bugs.',
      },
    };
  }
}