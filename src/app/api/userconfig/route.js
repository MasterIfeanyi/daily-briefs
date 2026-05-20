import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import UserConfig from '@/models/UserConfig';
import axios from 'axios';

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('briefing_session')?.value;
}

export async function GET() {
  try {
    await connectDB();
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });

    let config = await UserConfig.findOne({ sessionId });
    if (!config) config = await UserConfig.create({ sessionId });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });

    const { lat, lon } = await req.json();
    if (!lat || !lon) return NextResponse.json({ success: false, error: 'Missing coordinates' }, { status: 400 });

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

    return NextResponse.json({ success: true, data: updatedConfig });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });

    const body = await req.json();
    const config = await UserConfig.findOneAndUpdate(
      { sessionId },
      { ...body, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}