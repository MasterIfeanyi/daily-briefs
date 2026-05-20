import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import { getConfig } from '@/lib/getConfig';
import { fetchWeather } from '@/utils/fetchWeather';
import { fetchStocks } from '@/utils/fetchStocks';
import { fetchNews } from '@/utils/fetchNews';
import { generateBriefing } from '@/utils/generateBriefing';
import { getTodayKey } from '@/lib/getTodayKey';
import { cleanupOldBriefing } from '@/lib/cleanupOldBriefing';
import { getOrCreateSession } from '@/lib/getSession';

export async function GET() {
  try {
    await connectDB();

    const { sessionId, isNew } = await getOrCreateSession();
    const today = getTodayKey();

    await cleanupOldBriefing(today);

    const cached = await BriefingCache.findOne({ sessionId, date: today });
    if (cached) {
      const response = NextResponse.json({ success: true, data: cached.content, fromCache: true });
      if (isNew) attachSession(response, sessionId);
      return response;
    }

    const config = await getConfig(sessionId);

    const [weatherData, stockData, rawNewsData] = await Promise.all([
      fetchWeather(config.coordinates.lat, config.coordinates.lon),
      fetchStocks(config.stocks.us, config.stocks.world),
      // fetchNews(),
    ]);

    const aiContent = await generateBriefing(weatherData, rawNewsData, stockData, config);

    const briefingContent = {
      weather: weatherData,
      stocks: {
        us: stockData.us,
        world: stockData.world,
        commentary: aiContent.stockCommentary,
      },
      wordOfTheDay: aiContent.wordOfTheDay,
      joke: aiContent.joke,
      news: aiContent.news || [],
    };

    await BriefingCache.create({ sessionId, date: today, content: briefingContent });

    const response = NextResponse.json({ success: true, data: briefingContent, fromCache: false });
    if (isNew) attachSession(response, sessionId);
    return response;

  } catch (error) {
    console.error('BRIEFING CRASH:', error.message, error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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