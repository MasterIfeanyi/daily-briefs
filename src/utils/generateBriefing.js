import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseLooseJson } from './parseLooseJson';
import { withRetry } from './callWithRetry';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateBriefing(rawNewsData, stockData) {
  const model = genAI.getGenerativeModel({
    model: 'gemma-4-26b-a4b-it',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const usStocks = stockData && Array.isArray(stockData.us) ? stockData.us : [];
  const worldStocks = stockData && Array.isArray(stockData.world) ? stockData.world : [];
  const allStocks = [...usStocks, ...worldStocks];

  const prompt = `
You are a news editor. Your only job is to summarise news headlines and comment on stocks.
Respond ONLY with valid JSON. No markdown, no backticks, no explanation.

Generate this exact structure:
{
  "stockCommentary": "",
  "news": [
    { "title": "A clean, engaging rewrite of the actual headline",
      "description": "A crisp, 1-2 sentence executive summary of what happened based ONLY on the provided news text."},
    { "title": "A clean, engaging rewrite of the actual headline",
      "description": "A crisp, 1-2 sentence executive summary of what happened based ONLY on the provided news text."},
    { "title": "A clean, engaging rewrite of the actual headline",
      "description": "A crisp, 1-2 sentence executive summary of what happened based ONLY on the provided news text."},
  ]
}

CRITICAL RULES FOR THE "news" FIELD:
1. Do NOT invent stories. Only use the raw news data provided below.
2. Pick the top 3 most important global stories.
3. Rewrite the title cleanly, remove source tags like " - Reuters".
4. Summarise each story in 1 to 2 clean sentences.

Raw news data:
${JSON.stringify(rawNewsData.slice(0, 10))}

RULES FOR stockCommentary:
Write exactly one sentence about today's market mood based on these stocks:
${JSON.stringify(allStocks.map(s => ({ symbol: s.symbol, price: s.price, change: s.change })))}

Return ONLY the raw JSON object. Nothing else.  Do NOT include any introductory sentences, conversational responses, conversational filler, markdown explanations, or markdown bullets outside of the JSON output structure.
`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text().trim();
  return parseLooseJson(text);
}