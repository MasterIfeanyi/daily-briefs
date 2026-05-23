import { parseLooseJson } from './parseLooseJson';
import { withRetry } from './callWithRetry';

export async function generateBriefing(rawNewsData, stockData, dogBreed) {
  const usStocks = stockData && Array.isArray(stockData.us) ? stockData.us : [];
  const worldStocks = stockData && Array.isArray(stockData.world) ? stockData.world : [];
  const allStocks = [...usStocks, ...worldStocks];

  const breedLabel = dogBreed || 'dog';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const prompt = `
You are an expert news editor and daily briefing assistant. Your task is to process real-world raw information data feeds and format them neatly.
Respond ONLY with valid JSON. No markdown, no backticks, no explanation.

Today's date is ${today}.

Here is today's real raw news data:
${JSON.stringify(rawNewsData.slice(0, 10))}

Generate this exact JSON structure:

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
  "dogFunFact": ""
}

RULES FOR "news":
1. Do NOT invent fake events. Only use the raw news data provided above.
2. Select the top 3 most relevant or high-impact global stories from that list.
3. Clean up the titles (remove source tags like " - Reuters") and summarise each story in exactly 1 or 2 clean sentences.

RULES FOR "stockCommentary":
Write exactly one sentence of interesting context about today's markets based on these stocks:
${JSON.stringify(allStocks.map(s => ({ symbol: s.symbol, price: s.price, change: s.change })))}

RULES FOR "wordOfTheDay":
- Pick a real, interesting English word. Avoid overly common words like "happy" or "run".
- Prefer words that are vivid, obscure, or satisfying to say out loud.
- Fill in the part of speech, a plain-English definition, a natural example sentence, and a brief note about the word's origin or language it came from.

RULES FOR "joke":
- Keep it clean and family-friendly.
- Puns and wordplay are welcome.
- "setup" is the question or lead-in, "punchline" is the payoff.

RULES FOR "dogFunFact":
- Write exactly one genuinely interesting and specific fact about the ${breedLabel} breed.
- Do NOT say generic things like "dogs are loyal" or "dogs have been friends for 15,000 years".
- Be specific and surprising. For example, mention a historical role, a physical trait, a record, or a quirk unique to this breed.
- If you do not know this breed well, say something accurate about its general appearance or group classification.

Return ONLY the raw JSON object. No introductory sentences, no conversational filler, no markdown.
`;

  const makeRequest = async () => {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ifeanyi-brief.netlify.app',
        'X-Title': 'Daily Briefing',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1536,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error: ${err}`);
    }

    const data = await res.json();
    const text = data.choices[0].message.content.trim();
    return parseLooseJson(text);
  };

  return withRetry(makeRequest);
}