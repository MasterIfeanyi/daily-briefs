import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function getOrCreateSession() {
  const cookieStore = await cookies();
  const existing = cookieStore.get('briefing_session')?.value;

  if (existing) {
    return { sessionId: existing, isNew: false };
  }

  return { sessionId: uuidv4(), isNew: true };
}