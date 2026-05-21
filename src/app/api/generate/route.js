import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SharedBriefing from '@/models/SharedBriefing';
import { getTodayKey } from '@/lib/getTodayKey';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getTodayKeyLocal() {
  return new Date().toLocaleDateString('en-CA');
}

async function fetchStocks() {
  const tickers = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'NESN.SW', 'SONY.T', 'SAP.DE'];
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers.join(',')}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const data = await res.json();
  const results = data.quoteResponse.result;

  const usTickers = ['AAPL', 'TSLA', 'NVDA', 'MSFT'];
  const worldTickers = ['NESN.SW', 'SONY.T', 'SAP.DE'];

  const format = (q) => ({
    symbol: q.symbol,
    name: q.shortName,
    price: parseFloat(q.regularMarketPrice.toFixed(2)),
    change: parseFloat(q.regularMarketChangePercent.toFixed(2)),
    isUp: q.regularMarketChangePercent >= 0,
  });

  return {
    us: results.filter(q => usTickers.includes(q.symbol)).map(format),
    world: results.filter(q => worldTickers.includes(q.symbol)).map(format),
    raw: results.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChangePercent,
    })),
  };
}

async function fetchNews() {
  const res = await fetch(
    `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}&language=en&category=top`
  );
  const data = await res.json();
  return data.results || [];
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

    const [stockData, newsData] = await Promise.all([
      fetchStocks(),
      fetchNews(),
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