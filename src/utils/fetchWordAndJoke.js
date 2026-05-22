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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const res = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&page=Wiktionary:Word_of_the_day/${year}/${month}/${day}&prop=wikitext&format=json&origin=*`
    );
    const data = await res.json();
    const wikitext = data?.parse?.wikitext?.['*'];

    if (wikitext) {
      const wordMatch = wikitext.match(/\|word=([^\n|]+)/);
      const posMatch = wikitext.match(/\|pos=([^\n|]+)/);
      const defMatch = wikitext.match(/\|def=([^\n|]+)/);
      const exampleMatch = wikitext.match(/\|ex=([^\n|]+)/);
      const etymMatch = wikitext.match(/\|etym=([^\n|]+)/);

      if (wordMatch && defMatch) {
        wordOfTheDay = {
          word: wordMatch[1].trim(),
          partOfSpeech: posMatch?.[1]?.trim() || 'word',
          definition: defMatch[1].trim(),
          usedInSentence: exampleMatch?.[1]?.trim() || null,
          origin: etymMatch?.[1]?.trim() || null,
        };
      }
    }
  } catch (err) {
    console.error('Wiktionary word fetch failed:', err.message);
  }

  return { wordOfTheDay, joke };
}