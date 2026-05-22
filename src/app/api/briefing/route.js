import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import { getOrCreateSession } from '@/lib/getSession';
import { getTodayKey } from '@/lib/getTodayKey';

export async function GET() {
  try {
    await connectDB();

    const { sessionId, isNew } = await getOrCreateSession();
    const today = getTodayKey();

    const cache = await BriefingCache.findOne({ sessionId, date: today });

    if (cache?.status === 'complete') {
      const response = NextResponse.json({
        success: true,
        status: 'complete',
        data: cache.content,
      });
      if (isNew) attachSession(response, sessionId);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      status: 'pending',
    });

    if (isNew) attachSession(response, sessionId);
    return response;

  } catch (error) {
    console.error('BRIEFING CHECK CRASH:', error.message);
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