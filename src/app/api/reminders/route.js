import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';
import { getTodayKey } from '@/lib/getTodayKey';
import { cleanupOldReminders } from '@/lib/cleanupOldReminders';
import { getOrCreateSession } from '@/lib/getSession';

function attachSession(response, sessionId) {
  response.cookies.set('briefing_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
}

export async function GET(request) {
  try {
    await connectDB();
    const { sessionId, isNew } = await getOrCreateSession();
    const today = getTodayKey();
    await cleanupOldReminders(today);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || today;

    const reminders = await Reminder.find({ sessionId, date }).sort({ createdAt: 1 });

    const response = NextResponse.json({ success: true, data: reminders });
    if (isNew) attachSession(response, sessionId);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { sessionId, isNew } = await getOrCreateSession();
    const { text, date } = await request.json();

    if (!text || !date) {
      return NextResponse.json({ success: false, error: 'text and date are required' }, { status: 400 });
    }

    const reminder = await Reminder.create({ sessionId, text, date });
    const response = NextResponse.json({ success: true, data: reminder }, { status: 201 });
    if (isNew) attachSession(response, sessionId);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { sessionId } = await getOrCreateSession();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await Reminder.findOneAndDelete({ _id: id, sessionId });
    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}