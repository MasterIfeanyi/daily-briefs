import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json(
                { success: false, error: 'date query param is required' },
                { status: 400 }
            );
        }

        const reminders = await Reminder.find({ date }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, data: reminders });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { text, date } = body;

        if (!text || !date) {
            return NextResponse.json(
                { success: false, error: 'text and date are required' },
                { status: 400 }
            );
        }

        const reminder = await Reminder.create({ text, date });

        return NextResponse.json({ success: true, data: reminder }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id query param is required' },
                { status: 400 }
            );
        }

        await Reminder.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}