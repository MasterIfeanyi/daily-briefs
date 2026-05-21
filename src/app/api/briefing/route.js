import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SharedBriefing from '@/models/SharedBriefing';
import { getOrCreateSession } from '@/lib/getSession';
import { getConfig } from '@/lib/getConfig';
import { fetchWeather } from '@/utils/fetchWeather';
import { getTodayKey } from '@/lib/getTodayKey';
import { cleanupOldBriefing } from '@/lib/cleanupOldBriefing';

export async function GET() {
  try {
    await connectDB();

    const { sessionId, isNew } = await getOrCreateSession();
    const today = getTodayKey();
    await cleanupOldBriefing(today);

    const config = await getConfig(sessionId);

    const [shared, weatherData] = await Promise.all([
      SharedBriefing.findOne({ date: today }),
      fetchWeather(config.coordinates.lat, config.coordinates.lon),
    ]);

    if (!shared) {
      return NextResponse.json(
        {
          success: false,
          error: 'Briefing not yet generated for today. Check back soon.',
        },
        { status: 503 }
      );
    }

    const briefingContent = {
      weather: weatherData,
      stocks: shared.content.stocks,
      wordOfTheDay: shared.content.wordOfTheDay,
      joke: shared.content.joke,
      news: shared.content.news || [],
      dog: shared.content.dog || null,
      onThisDay: shared.content.onThisDay || [],
    };

    const response = NextResponse.json({
      success: true,
      data: briefingContent,
      fromCache: false,
    });

    if (isNew) attachSession(response, sessionId);
    return response;

  } catch (error) {
    console.error('BRIEFING CRASH:', error.message);
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