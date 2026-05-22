export async function fetchWordAndJoke() {
  try {
    const [wordRes, jokeRes] = await Promise.all([
      fetch('https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=a2a73e7b947cad4227a0b83062480ca7e7ad7b9f8'),
      fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist&type=twopart'),
    ]);

    const wordData = await wordRes.json();
    const jokeData = await jokeRes.json();

    return {
      wordOfTheDay: {
        word: wordData.word || 'Serendipity',
        partOfSpeech: wordData.definitions?.[0]?.partOfSpeech || 'noun',
        definition: wordData.definitions?.[0]?.text || 'The occurrence of events by chance in a happy or beneficial way.',
        usedInSentence: wordData.examples?.[0]?.text || 'It was pure serendipity that they met that day.',
        origin: 'From the Persian fairy tale "The Three Princes of Serendip".',
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