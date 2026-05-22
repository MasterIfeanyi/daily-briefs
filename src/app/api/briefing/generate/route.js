// app/api/briefing/generate/route.js
export const runtime = 'nodejs';
export const maxDuration = 60;

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

    // Race the AI call against a 25-second timeout
    const aiContent = await Promise.race([
      callWithRetry(() => generateBriefing(news, stocks, dog.breed), 1, 0),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 25000)
      ),
    ]);

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
      status: 'complete',
      data: briefingContent,
      fromCache: false,
    });

    if (isNew) attachSession(response, sessionId);
    return response;

  } catch (error) {
    // If it timed out, tell the frontend to try again
    if (error.message === 'AI_TIMEOUT') {
      return NextResponse.json(
        { success: false, status: 'timeout', error: 'Still generating, please retry.' },
        { status: 202 }
      );
    }

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