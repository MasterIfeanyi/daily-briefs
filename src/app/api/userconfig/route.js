import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserConfig from '@/models/UserConfig';
import axios from 'axios';
import { getOrCreateSession } from '@/lib/getSession';

function attachSession(response, sessionId) {
  response.cookies.set('briefing_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
}

export async function GET() {
  try {
    await connectDB();
    const { sessionId, isNew } = await getOrCreateSession();

    let config = await UserConfig.findOne({ sessionId });
    if (!config) config = await UserConfig.create({ sessionId });

    const response = NextResponse.json({ success: true, data: config });
    if (isNew) attachSession(response, sessionId);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { sessionId, isNew } = await getOrCreateSession();
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return NextResponse.json({ success: false, error: 'Missing coordinates' }, { status: 400 });
    }

    let cityName = 'Lagos';
    let timezone = 'Africa/Lagos';

    try {
      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'DailyBriefingApp/1.0' } }
      );
      cityName = geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.village || cityName;
    } catch (e) {
      console.error('Geocoding failed:', e);
    }

    try {
      const tzRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
      );
      timezone = tzRes.data.timezone || timezone;
    } catch (e) {
      console.error('Timezone failed:', e);
    }

    const updatedConfig = await UserConfig.findOneAndUpdate(
      { sessionId },
      { city: cityName, coordinates: { lat, lon }, timezone, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const response = NextResponse.json({ success: true, data: updatedConfig });
    if (isNew) attachSession(response, sessionId);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { sessionId, isNew } = await getOrCreateSession();
    const body = await req.json();

    const config = await UserConfig.findOneAndUpdate(
      { sessionId },
      { ...body, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const response = NextResponse.json({ success: true, data: config });
    if (isNew) attachSession(response, sessionId);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}