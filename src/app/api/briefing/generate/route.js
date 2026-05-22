import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import { getOrCreateSession } from '@/lib/getSession';
import { generateBriefing } from '@/utils/generateBriefing';
import { getTodayKey } from '@/lib/getTodayKey';

export async function GET() {
  try {
    await connectDB();

    const { sessionId, isNew } = await getOrCreateSession();
    const today = getTodayKey();

    const cache = await BriefingCache.findOne({ sessionId, date: today });

    if (!cache) {
      return NextResponse.json(
        { success: false, error: 'No raw data found. Call /api/briefing/data first.' },
        { status: 400 }
      );
    }

    if (cache.status === 'complete') {
      const response = NextResponse.json({
        success: true,
        aiContent: {
          news: cache.content.news,
          stockCommentary: cache.content.stocks.commentary,
        },
        fromCache: true,
      });
      if (isNew) attachSession(response, sessionId);
      return response;
    }

    const { news, stocks } = cache.rawData;

    const aiContent = await generateBriefing(news, stocks);

    const updatedContent = {
      weather: cache.rawData.weather,
      stocks: {
        us: stocks.us,
        world: stocks.world,
        commentary: aiContent.stockCommentary,
      },
      wordOfTheDay: cache.rawData.wordOfTheDay,
      joke: cache.rawData.joke,
      news: aiContent.news || [],
      dog: {
        imageUrl: cache.rawData.dog.imageUrl,
        breed: cache.rawData.dog.breed,
        funFact: cache.rawData.dog.funFact,
      },
      onThisDay: cache.rawData.onThisDay || [],
    };

    await BriefingCache.findOneAndUpdate(
      { sessionId, date: today },
      { status: 'complete', content: updatedContent },
      { new: true }
    );

    const response = NextResponse.json({
      success: true,
      aiContent: {
        news: aiContent.news || [],
        stockCommentary: aiContent.stockCommentary,
      },
      fromCache: false,
    });

    if (isNew) attachSession(response, sessionId);
    return response;

  } catch (error) {
    console.error('GENERATE CRASH:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function attachSession(response, sessionId) {
  response.cookies.set('briefing_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
}

export const runtime = 'nodejs';
export const maxDuration = 60;