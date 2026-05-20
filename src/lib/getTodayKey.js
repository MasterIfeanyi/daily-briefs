// lib/getTodayKey.js
export function getTodayKey() {
  return new Date().toLocaleDateString('en-CA');
}