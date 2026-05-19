import { GoogleGenerativeAI } from '@google/generative-ai';
import {parseLooseJson} from './parseLooseJson';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export async function generateBriefing(weatherData, stockData, config) {
  const model = genAI.getGenerativeModel({
    model: 'gemma-4-26b-a4b-it',
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const allStocks = [...stockData.us, ...stockData.world];

  const prompt = `
You are generating content for a daily briefing app. Be concise and interesting.
Respond ONLY with valid JSON, no markdown, no backticks, no explanation.

The user is based in ${config.city}.
Current weather: ${JSON.stringify(weatherData.temperature)}
Sunrise: ${weatherData.sunrise}
Sunset: ${weatherData.sunset}

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



For stockCommentary, write one sentence of interesting context about today's markets based on these stocks: ${JSON.stringify(allStocks.map(s => ({ symbol: s.symbol, price: s.regularMarketPrice, change: s.regularMarketChangePercent })))}

Return ONLY a raw JSON object. Do NOT include any introductory sentences, conversational responses, conversational filler, markdown explanations, or markdown bullets outside of the JSON output structure.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Clean and parse the strict response text
  return parseLooseJson(text);
}