import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function middleware(request) {
  const response = NextResponse.next();
  const existing = request.cookies.get('briefing_session');

  if (!existing) {
    const sessionId = uuidv4();
    response.cookies.set('briefing_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};