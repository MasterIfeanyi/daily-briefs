import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function getSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get('briefing_session');
  if (existing) return existing.value;
  return null;
}

export function createSessionId() {
  return uuidv4();
}