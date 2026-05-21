import connectDB from '../../src/lib/mongodb.js';
import SharedBriefing from '../../src/models/SharedBriefing.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchStocks } from '../../src/utils/fetchStocks.js';
import { fetchNews } from '../../src/utils/fetchNews.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getTodayKey() {
    return new Date().toLocaleDateString('en-CA');
}



async function generateContent(stockData, newsData) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: 'gemma-4-26b-a4b-it',
        generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
You are a daily briefing assistant. Respond ONLY with valid JSON, no markdown, no backticks.

Generate this exact structure:
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
    { "title": "", "description": "" },
    { "title": "", "description": "" },
    { "title": "", "description": "" }
  ]
}

For stockCommentary, write one sentence about today's markets based on:
${JSON.stringify(stockData.raw)}

For news, pick the top 3 stories from this raw data, clean the titles, summarise each in 1-2 sentences:
${JSON.stringify(newsData.slice(0, 10))}

Return ONLY raw JSON. No extra text outside the JSON.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '');
    return JSON.parse(text);
}

export default async function handler() {
    try {
        await connectDB();

        const today = getTodayKey();

        const existing = await SharedBriefing.findOne({ date: today });
        if (existing) {
            console.log('Briefing already exists for today, skipping.');
            return new Response('Already done', { status: 200 });
        }

        console.log('Fetching stocks and news...');
        const [stockData, newsData] = await Promise.all([
            fetchStocks(),
            fetchNews(),
        ]);

        console.log('Calling Gemma...');
        const aiContent = await generateContent(stockData, newsData);

        await SharedBriefing.create({
            date: today,
            content: {
                stocks: {
                    us: stockData.us,
                    world: stockData.world,
                    commentary: aiContent.stockCommentary,
                },
                wordOfTheDay: aiContent.wordOfTheDay,
                joke: aiContent.joke,
                news: aiContent.news || [],
            },
        });

        console.log('Briefing saved successfully for', today);
        return new Response('Done', { status: 200 });

    } catch (err) {
        console.error('Scheduled briefing failed:', err);
        return new Response(err.message, { status: 500 });
    }
}

export const config = {
    schedule: '0 5 * * *',
};