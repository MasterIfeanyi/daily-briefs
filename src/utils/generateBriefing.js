export async function generateWithGemma(weatherData, stockData, config) {
  const model = genAI.getGenerativeModel({ model: 'gemma-4-26b-a4b-it' });

  const prompt = `
You are generating content for a daily briefing app. Be concise and interesting.
Respond ONLY with valid JSON, no markdown, no backticks, no explanation.

The user is based in ${config.city}.
Current weather: ${JSON.stringify(weatherData.current)}
Sunrise: ${weatherData.daily.sunrise[0]}
Sunset: ${weatherData.daily.sunset[0]}

Generate the following JSON structure exactly:
{
  "wordOfTheDay": {
    "word": "",
    "partOfSpeech": "",
    "definition": "",
    "usedInSentence": "",
    "origin": ""
  },
  "joke": {
    "setup": "",
    "punchline": ""
  },
  "stockCommentary": ""
}

For stockCommentary, write one sentence of interesting context about today's markets based on these stocks: ${JSON.stringify(stockData.map(s => ({ symbol: s.symbol, price: s.regularMarketPrice, change: s.regularMarketChangePercent })))}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}