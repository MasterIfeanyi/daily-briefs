import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SharedBriefing from '@/models/SharedBriefing';
import { fetchStocks } from '@/utils/fetchStocks.js';
import { fetchNews } from '@/utils/fetchNews.js';
import { fetchDog } from '@/utils/fetchDog';
import { fetchOnThisDay } from '@/utils/fetchOnThisDay';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getTodayKeyLocal() {
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

export async function GET() {
    try {
        await connectDB();

        const today = getTodayKeyLocal();

        const existing = await SharedBriefing.findOne({ date: today });
        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Briefing already exists for today, nothing to do.',
            });
        }

        const [stockData, newsData, dogData, onThisDayData] = await Promise.all([
            fetchStocks(),
            fetchNews(),
            fetchDog(),
            fetchOnThisDay(),
        ]);

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
                dog: dogData,
                onThisDay: onThisDayData,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Briefing generated and saved successfully.',
        });

    } catch (error) {
        console.error('Admin generate failed:', error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}