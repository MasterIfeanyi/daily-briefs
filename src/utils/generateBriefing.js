import { GoogleGenerativeAI } from '@google/generative-ai';
import {parseLooseJson} from './parseLooseJson';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export async function generateBriefing(weatherData, rawNewsData, stockData, config) {
  const model = genAI.getGenerativeModel({
    model: 'gemma-4-26b-a4b-it',
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const allStocks = [...stockData.us, ...stockData.world];

  const prompt = `
You are an expert news editor and daily briefing assistant. Your task is to process real-world raw information data feeds and format them neatly.
Respond ONLY with valid JSON, no markdown, no backticks, no explanation.

The user is based in ${config.city}.
Current weather: ${JSON.stringify(weatherData.temperature)}
Sunrise: ${weatherData.sunrise}
Sunset: ${weatherData.sunset}

Here is today's real raw news data:
${JSON.stringify(rawNewsData)}

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
  "stockCommentary": "",
  "news": [
    {
      "title": "A clean, engaging rewrite of the actual headline",
      "description": "A crisp, 1-2 sentence executive summary of what happened based ONLY on the provided news text."
    },
    {
      "title": "A clean, engaging rewrite of the actual headline",
      "description": "A crisp, 1-2 sentence executive summary of what happened based ONLY on the provided news text."
    },
    {
      "title": "A clean, engaging rewrite of the actual headline",
      "description": "A crisp, 1-2 sentence executive summary of what happened based ONLY on the provided news text."
    }
  ]
}

CRITICAL RULES FOR THE "news" FIELD:
1. Do NOT invent fake events. Read the incoming raw news data array provided above.
2. Select the top 3 most relevant or high-impact global stories from that list.
3. Clean up the titles (remove source tags like ' - Reuters') and summarize the content body text into exactly 1 or 2 clean sentences.

For stockCommentary, write one sentence of interesting context about today's markets based on these stocks: ${JSON.stringify(allStocks.map(s => ({ symbol: s.symbol, price: s.regularMarketPrice, change: s.regularMarketChangePercent })))}

Return ONLY a raw JSON object. Do NOT include any introductory sentences, conversational responses, conversational filler, markdown explanations, or markdown bullets outside of the JSON output structure.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Clean and parse the strict response text
  return parseLooseJson(text);
}