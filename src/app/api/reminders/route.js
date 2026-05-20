import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';
import { getTodayKey } from '@/lib/getTodayKey';
import { cleanupOldReminders } from '@/lib/cleanupOldReminders';

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('briefing_session')?.value;
}

export async function GET(request) {
  try {
    await connectDB();
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });

    const today = getTodayKey();
    await cleanupOldReminders(today);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || today;

    const reminders = await Reminder.find({ sessionId, date }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: reminders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });

    const { text, date } = await request.json();
    if (!text || !date) return NextResponse.json({ success: false, error: 'text and date are required' }, { status: 400 });

    const reminder = await Reminder.create({ sessionId, text, date });

    return NextResponse.json({ success: true, data: reminder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });

    await Reminder.findOneAndDelete({ _id: id, sessionId });

    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}