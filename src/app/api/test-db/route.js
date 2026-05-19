// app/api/test-db/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const startTime = Date.now();
    
    await connectDB();
    
    const duration = Date.now() - startTime;
    console.log(`Connected in ${duration}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully',
      duration: `${duration}ms`
    });
  } catch (error) {
    console.error('Connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}