// This is trip one. It fetches weather, stocks, news, dog, and on this day, then saves the raw data to MongoDB.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import { getOrCreateSession } from '@/lib/getSession';
import { getConfig } from '@/lib/getConfig';
import { fetchWeather } from '@/utils/fetchWeather';
import { fetchStocks } from '@/utils/fetchStocks';
import { fetchNews } from '@/utils/fetchNews';
import { fetchDog } from '@/utils/fetchDog';
import { fetchOnThisDay } from '@/utils/fetchOnThisDay';
import { getTodayKey } from '@/lib/getTodayKey';
import { cleanupOldBriefings } from '@/lib/cleanupOldBriefings';

export async function GET() {
  try {
    await connectDB();

    const { sessionId, isNew } = await getOrCreateSession();
    const today = getTodayKey();

    await cleanupOldBriefings(today, sessionId);

    const existing = await BriefingCache.findOne({ sessionId, date: today });

    if (existing?.status === 'complete') {
      const response = NextResponse.json({
        success: true,
        status: 'complete',
        data: existing.content,
      });
      if (isNew) attachSession(response, sessionId);
      return response;
    }

    if (existing?.status === 'raw') {
      const response = NextResponse.json({
        success: true,
        status: 'raw',
        message: 'Raw data already fetched, proceed to generate.',
      });
      if (isNew) attachSession(response, sessionId);
      return response;
    }

    const config = await getConfig(sessionId);

    const [weatherData, stockData, newsData, dogData, onThisDayData] = await Promise.all([
      fetchWeather(config.coordinates.lat, config.coordinates.lon),
      fetchStocks(),
      fetchNews(),
      fetchDog(),
      fetchOnThisDay(),
    ]);

    await BriefingCache.create({
      sessionId,
      date: today,
      status: 'raw',
      rawData: {
        weather: weatherData,
        stocks: stockData,
        news: newsData,
        dog: dogData,
        onThisDay: onThisDayData,
      },
    });

    const response = NextResponse.json({
      success: true,
      status: 'raw',
      message: 'Raw data fetched successfully.',
    });

    if (isNew) attachSession(response, sessionId);
    return response;

  } catch (error) {
    console.error('DATA FETCH CRASH:', error.message);
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