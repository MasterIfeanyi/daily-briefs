import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseLooseJson } from './parseLooseJson';
import { withRetry } from './callWithRetry';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateBriefing(rawNewsData, stockData, dogBreed) {
  const model = genAI.getGenerativeModel({
    model: 'gemma-4-26b-a4b-it',
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const usStocks = stockData && Array.isArray(stockData.us) ? stockData.us : [];
  const worldStocks = stockData && Array.isArray(stockData.world) ? stockData.world : [];
  const allStocks = [...usStocks, ...worldStocks];

  const prompt = `
You are an expert news editor and daily briefing assistant. Your task is to process real-world raw information data feeds and format them neatly.
Respond ONLY with valid JSON, no markdown, no backticks, no explanation.

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
  ],
  "dogFunFact": "A genuinely interesting and specific fun fact about the ${dogBreed || 'dog'} breed. Not generic. Real and surprising.",
}

CRITICAL RULES FOR THE "news" FIELD:
1. Do NOT invent fake events. Read the incoming raw news data array provided above.
2. Select the top 3 most relevant or high-impact global stories from that list.
3. Clean up the titles (remove source tags like ' - Reuters') and summarize the content body text into exactly 1 or 2 clean sentences.

For stockCommentary, write one sentence of interesting context about today's markets based on these stocks: ${JSON.stringify(allStocks.map(s => ({ symbol: s.symbol, price: s.price, change: s.change })))}

For dogFunFact, write one genuinely interesting and specific fact about the ${dogBreed || 'dog'} breed. Avoid generic statements like "dogs are loyal". Be specific and surprising.

Return ONLY a raw JSON object. Do NOT include any introductory sentences, conversational responses, conversational filler, markdown explanations, or markdown bullets outside of the JSON output structure.
`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text().trim();

  return parseLooseJson(text);
}