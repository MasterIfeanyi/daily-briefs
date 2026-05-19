// app/api/env-check/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  // Log what's available (without exposing full strings in production)
  const hasMongoURI = !!process.env.MONGODB_URI;
  const hasDatabaseURI = !!process.env.DATABASE_URI;
  const mongoURIPrefix = process.env.MONGODB_URI ? 
    process.env.MONGODB_URI.substring(0, 20) + '...' : 'not found';
  
  console.log('MONGODB_URI exists:', hasMongoURI);
  console.log('DATABASE_URI exists:', hasDatabaseURI);
  console.log('MONGODB_URI prefix:', mongoURIPrefix);
  
  return NextResponse.json({
    hasMONGODB_URI: hasMongoURI,
    hasDATABASE_URI: hasDatabaseURI,
    mongoURIPrefix: mongoURIPrefix,
    nodeEnv: process.env.NODE_ENV,
    allKeys: Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DATABASE'))
  });
}