// utils/generateBriefing.js

import { parseLooseJson } from './parseLooseJson';
import { withRetry } from './callWithRetry';

export async function generateBriefing(rawNewsData, stockData, dogBreed, weatherData, locationInfo, onThisDayMeta) {
  const usStocks = stockData && Array.isArray(stockData.us) ? stockData.us : [];
  const worldStocks = stockData && Array.isArray(stockData.world) ? stockData.world : [];
  const allStocks = [...usStocks, ...worldStocks];

  const breedLabel = dogBreed || 'dog';
  const cityLabel = locationInfo?.city || 'the user\'s location';
  const lat = locationInfo?.lat ?? null;
  const lon = locationInfo?.lon ?? null;

  const tz = locationInfo?.timezone || 'UTC';
  const today = new Date().toLocaleDateString('en-US', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const prompt = `
You are an expert daily briefing assistant. Process the data below and return a single JSON object.
Respond ONLY with valid JSON. No markdown, no backticks, no explanation.

Today's date is ${today}.

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
      "title": "",
      "description": ""
    },
    {
      "title": "",
      "description": ""
    },
    {
      "title": "",
      "description": ""
    }
  ],
  "dogFunFact": "",
  "weatherTip": "",
  "onThisDay": [
    { "year": "", "event": "" },
    { "year": "", "event": "" },
    { "year": "", "event": "" }
  ]
}

---

RULES FOR "news":
1. Do NOT invent fake events. Only use the raw news data provided below.
2. Select the top 3 most relevant or high-impact global stories.
3. Rewrite titles cleanly (remove source tags like " - Reuters") and summarise each story in 1-2 clean sentences.

Raw news data:
${JSON.stringify(rawNewsData.slice(0, 10))}

---

RULES FOR "stockCommentary":
Write exactly one sentence about today's market mood based on these stocks:
${JSON.stringify(allStocks.map(s => ({ symbol: s.symbol, price: s.price, change: s.change })))}

---

RULES FOR "wordOfTheDay":
- Pick a real, interesting English word. Avoid very common words like "happy" or "run".
- Prefer vivid, obscure, or satisfying-to-say words.
- Fill in part of speech, a plain-English definition, a natural example sentence, and the word's language origin.

---

RULES FOR "joke":
- Clean and family-friendly. Puns and wordplay welcome.
- "setup" is the question or lead-in, "punchline" is the payoff.

---

RULES FOR "dogFunFact":
- One genuinely interesting and specific fact about the ${breedLabel} breed.
- No generic statements like "dogs are loyal". Be specific: mention a historical role, physical trait, record, or quirk unique to this breed.

---

RULES FOR "weatherTip":
Write exactly one friendly, practical sentence advising the user what to expect or prepare for today, based on:
- City: ${cityLabel}
- Coordinates: lat ${lat}, lon ${lon}
- Current weather data: ${JSON.stringify(weatherData)}
- Today's date: ${today}

Consider what season or weather pattern is typical for this location at this time of year.
For example, if it is Lagos in November, mention Harmattan dust. If it is Toronto in January, mention the cold.
If the weather data shows rain, tell them to carry an umbrella.
Keep it warm, friendly, and practical. One sentence only.

---

RULES FOR "onThisDay":
Generate exactly 3 notable historical events that happened on ${onThisDayMeta?.month} ${onThisDayMeta?.day} in different years throughout history.
- Events must be real and verifiable. Do not invent events.
- Cover a range of different centuries and topics (science, politics, culture, exploration, etc.).
- Each entry has a "year" (just the number as a string, e.g. "1969") and an "event" (one clear sentence describing what happened).

---

Return ONLY the raw JSON object. No introductory sentences, no filler, no markdown.
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
        max_tokens: 2048,
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