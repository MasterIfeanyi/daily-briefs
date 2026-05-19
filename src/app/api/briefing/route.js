import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import { getConfig } from '@/lib/getConfig';
import { fetchWeather } from '@/utils/fetchWeather';
import { fetchStocks } from '@/utils/fetchStocks';
import { generateBriefing } from '@/utils/generateBriefing';

export async function GET() {
  try {
    await connectDB();

    const today = new Date().toISOString().split('T')[0];

    const cached = await BriefingCache.findOne({ date: today });
    if (cached) {
      return NextResponse.json({ success: true, data: cached.content, fromCache: true });
    }

    const config = await getConfig();

    const [weatherData, stockData] = await Promise.all([
      fetchWeather(config.coordinates.lat, config.coordinates.lon),
      fetchStocks(config.stocks.us, config.stocks.world),
    ]);

    const aiContent = await generateBriefing(weatherData, stockData, config);

    const briefingContent = {
      weather: weatherData,
      stocks: {
        us: stockData.us,
        world: stockData.world,
        commentary: aiContent.stockCommentary,
      },
      wordOfTheDay: aiContent.wordOfTheDay,
      joke: aiContent.joke,
    };

    await BriefingCache.create({ date: today, content: briefingContent });

    return NextResponse.json({ success: true, data: briefingContent, fromCache: false });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}