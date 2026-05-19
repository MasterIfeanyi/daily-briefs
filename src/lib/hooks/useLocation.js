'use client';

import { useState } from 'react';

export function useLocation() {
  const [status, setStatus] = useState('idle'); // idle | requesting | saving | done | error | denied
  const [error, setError] = useState(null);

  async function requestLocation() {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation.');
      setStatus('error');
      return;
    }

    setStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          setStatus('saving');

          const res = await fetch('/api/config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coordinates: { lat: latitude, lon: longitude },
            }),
          });

          const data = await res.json();

          if (!data.success) {
            throw new Error(data.error);
          }

          setStatus('done');
        } catch (err) {
          setError(err.message);
          setStatus('error');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location permission was denied. Weather will use your default city.');
        } else {
          setStatus('error');
          setError('Could not get your location. Try again.');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return { status, error, requestLocation };
}