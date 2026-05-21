import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    fmp_key_exists: !!process.env.FMP_API_KEY,
    fmp_key_length: process.env.FMP_API_KEY?.length || 0,
    gemini_key_exists: !!process.env.GEMINI_API_KEY,
    mongodb_exists: !!process.env.MONGODB_URI,
  });
}