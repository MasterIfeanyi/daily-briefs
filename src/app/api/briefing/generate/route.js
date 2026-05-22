// This is trip two. It reads the raw data from MongoDB and sends it to Gemma.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import { getOrCreateSession } from '@/lib/getSession';
import { generateBriefing } from '@/utils/generateBriefing';
import { getTodayKey } from '@/lib/getTodayKey';
import { callWithRetry } from '@/utils/callWithRetry';

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
        data: cache.content,
        fromCache: true,
      });
      if (isNew) attachSession(response, sessionId);
      return response;
    }

    const { weather, stocks, news, dog } = cache.rawData;

    const aiContent = await callWithRetry(generateBriefing(news, stocks, dog.breed));

    const briefingContent = {
      weather,
      stocks: {
        us: stocks.us,
        world: stocks.world,
        commentary: aiContent.stockCommentary,
      },
      wordOfTheDay: aiContent.wordOfTheDay,
      joke: aiContent.joke,
      news: aiContent.news || [],
      dog: {
        imageUrl: dog.imageUrl,
        breed: dog.breed,
        funFact: aiContent.dogFunFact,
      },
      onThisDay: cache.rawData.onThisDay || [],
    };

    await BriefingCache.findOneAndUpdate(
      { sessionId, date: today },
      { status: 'complete', content: briefingContent },
      { new: true }
    );

    const response = NextResponse.json({
      success: true,
      data: briefingContent,
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