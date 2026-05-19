import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserConfig from '@/models/UserConfig';

export async function GET() {
  try {
    await connectDB();

    let config = await UserConfig.findOne();

    if (!config) {
      config = await UserConfig.create({});
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const body = await request.json();

    let config = await UserConfig.findOne();

    if (!config) {
      config = await UserConfig.create(body);
    } else {
      Object.assign(config, body);
      config.updatedAt = new Date();
      await config.save();
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}