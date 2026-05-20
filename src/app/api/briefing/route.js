import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import { getConfig } from '@/lib/getConfig';
import { fetchWeather } from '@/utils/fetchWeather';
import { fetchStocks } from '@/utils/fetchStocks';
import { fetchNews } from '@/utils/fetchNews';
import { generateBriefing } from '@/utils/generateBriefing';
import { getTodayKey } from '@/lib/getTodayKey';
import { cleanupOldBriefing } from '@/lib/cleanupOldBriefing';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('briefing_session')?.value;
    if (!sessionId) return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });

    const today = getTodayKey();
    await cleanupOldBriefing(today);

    const cached = await BriefingCache.findOne({ sessionId, date: today });
    if (cached) {
      return NextResponse.json({ success: true, data: cached.content, fromCache: true });
    }

    const config = await getConfig(sessionId);

    const [weatherData, stockData, rawNewsData] = await Promise.all([
      fetchWeather(config.coordinates.lat, config.coordinates.lon),
      fetchStocks(config.stocks.us, config.stocks.world),
      fetchNews(),
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

    return NextResponse.json({ success: true, data: briefingContent, fromCache: false });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}