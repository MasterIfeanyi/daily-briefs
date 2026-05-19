// app/api/debug/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BriefingCache from '@/models/BriefingCache';
import UserConfig from '@/models/UserConfig';
import Reminder from '@/models/Reminder';

export async function GET() {
  const results = {};
  
  try {
    await connectDB();
    results.connection = "✅ Connected to MongoDB";
    
    // Test BriefingCache model
    try {
      const count = await BriefingCache.countDocuments();
      results.briefingCache = `✅ Model works (${count} documents)`;
    } catch (e) {
      results.briefingCache = `❌ Error: ${e.message}`;
    }
    
    // Test UserConfig model
    try {
      const config = await UserConfig.findOne();
      results.userConfig = config ? "✅ Found config" : "⚠️ No config yet (will be auto-created)";
    } catch (e) {
      results.userConfig = `❌ Error: ${e.message}`;
    }
    
    // Test Reminder model
    try {
      const count = await Reminder.countDocuments();
      results.reminders = `✅ Model works (${count} documents)`;
    } catch (e) {
      results.reminders = `❌ Error: ${e.message}`;
    }
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}