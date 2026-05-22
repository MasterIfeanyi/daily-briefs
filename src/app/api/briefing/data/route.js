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
import { fetchWordAndJoke } from '@/utils/fetchWordAndJoke';

export async function GET() {
    try {
        await connectDB();

        const { sessionId, isNew } = await getOrCreateSession();
        const today = getTodayKey();

        await cleanupOldBriefings(today, sessionId);

        const existing = await BriefingCache.findOne({ sessionId, date: today });

        if (existing) {
            const response = NextResponse.json({
                success: true,
                status: existing.status,
                data: {
                    weather: existing.rawData.weather,
                    stocks: existing.rawData.stocks,
                    dog: existing.rawData.dog,
                    onThisDay: existing.rawData.onThisDay,
                    wordOfTheDay: existing.rawData.wordOfTheDay,
                    joke: existing.rawData.joke,
                },
                aiContent: existing.status === 'complete' ? {
                    news: existing.content.news,
                    stockCommentary: existing.content.stocks.commentary,
                } : null,
            });
            if (isNew) attachSession(response, sessionId);
            return response;
        }

        const config = await getConfig(sessionId);

        const [weatherData, stockData, newsData, dogData, onThisDayData, wordAndJoke] =
            await Promise.all([
                fetchWeather(config.coordinates.lat, config.coordinates.lon),
                fetchStocks(),
                fetchNews(),
                fetchDog(),
                fetchOnThisDay(),
                fetchWordAndJoke(),
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
                wordOfTheDay: wordAndJoke.wordOfTheDay,
                joke: wordAndJoke.joke,
            },
        });

        const response = NextResponse.json({
            success: true,
            status: 'raw',
            data: {
                weather: weatherData,
                stocks: stockData,
                dog: dogData,
                onThisDay: onThisDayData,
                wordOfTheDay: wordAndJoke.wordOfTheDay,
                joke: wordAndJoke.joke,
            },
            aiContent: null,
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

export const runtime = 'nodejs';
export const maxDuration = 60;