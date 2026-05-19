'use client';

import { useLocation } from '@/lib/hooks/useLocation';

export default function LocationPrompt() {
  const { status, error, requestLocation } = useLocation();

  if (status === 'done') {
    return (
      <p className="text-sm text-green-600 dark:text-green-400">
        Location saved. Your next briefing will use your current city.
      </p>
    );
  }

  if (status === 'denied') {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        {error}
      </p>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={requestLocation}
          className="text-sm underline text-left text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={requestLocation}
      disabled={status === 'requesting' || status === 'saving'}
      className="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 
                 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {status === 'requesting' && 'Waiting for permission...'}
      {status === 'saving' && 'Saving location...'}
      {status === 'idle' && 'Use my current location'}
    </button>
  );
}