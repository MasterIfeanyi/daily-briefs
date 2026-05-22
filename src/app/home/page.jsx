"use client";

import { useState, useEffect, useCallback } from "react";
import WeatherCard from "@/components/WeatherCard";
import StockRow from "@/components/StockRow";
import WordCard from "@/components/WordCard";
import JokeCard from "@/components/JokeCard";
import RemindersPanel from "@/components/RemindersPanel";
import WorldStocks from "@/components/WorldStocks";
import NewsSection from "@/components/NewsSection";
import DogCard from "@/components/DogCard";
import OnThisDayCard from "@/components/OnThisDayCard";
import NavbarLayout from "@/components/NavbarLayout";
import Footer from "@/components/Footer";
import { getGreeting } from "@/utils/greeting";

const SectionHeader = ({ title }) => (
  <div className="mt-8 mb-4">
    <h2 className="text-(--brand) text-sm font-extrabold uppercase tracking-widest mb-2">
      {title}
    </h2>
    <hr className="border-(--border)" />
  </div>
);

const LoadingScreen = ({ message }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-4 border-(--brand) border-t-transparent rounded-full animate-spin" />
    <p className="text-(--muted-foreground) text-sm font-medium">{message}</p>
  </div>
);

export default function DailyBriefing() {
  const [data, setData] = useState(null);
  const [loadingStep, setLoadingStep] = useState('checking');
  const [error, setError] = useState(null);

  const pollUntilReady = useCallback(async () => {
    const maxAttempts = 20; // 20 x 3s = 60 seconds max wait
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((res) => setTimeout(res, 3000));
      const res = await fetch('/api/briefing', { credentials: 'include' });
      const json = await res.json();
      if (json.status === 'complete') {
        setData(json.data);
        setLoadingStep('done');
        return;
      }
    }
    throw new Error('Briefing took too long to generate.');
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoadingStep('checking');
        const checkRes = await fetch('/api/briefing', { credentials: 'include' });
        const checkData = await checkRes.json();

        if (checkData.status === 'complete') {
          setData(checkData.data);
          setLoadingStep('done');
          return;
        }

        setLoadingStep('fetching');
        const dataRes = await fetch('/api/briefing/data', { credentials: 'include' });
        const dataJson = await dataRes.json();
        if (!dataJson.success) throw new Error(dataJson.error);

        setLoadingStep('generating');
        // Kick off generation — this returns immediately now
        await fetch('/api/briefing/generate', { credentials: 'include' });

        // Poll every 3 seconds until the briefing is ready
        await pollUntilReady();

      } catch (err) {
        console.error('Bootstrap failed:', err.message);
        setError(err.message);
        setLoadingStep('done');
      }
    }

    bootstrap();
  }, [pollUntilReady]);

  useEffect(() => {
    const hasPrompted = document.cookie.includes('briefing_location_prompted=true');

    if (!hasPrompted && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          document.cookie = 'briefing_location_prompted=true; max-age=31536000; path=/';
          try {
            await fetch('/api/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              }),
            });
          } catch (err) {
            console.error('Location sync failed:', err.message);
          }
        },
        () => {
          document.cookie = 'briefing_location_prompted=true; max-age=31536000; path=/';
        }
      );
    }
  }, []);

  if (loadingStep === 'checking') {
    return (
      <NavbarLayout>
        <LoadingScreen message="Checking your briefing..." />
      </NavbarLayout>
    );
  }

  if (loadingStep === 'fetching') {
    return (
      <NavbarLayout>
        <LoadingScreen message="Fetching weather, stocks, and news..." />
      </NavbarLayout>
    );
  }

  if (loadingStep === 'generating') {
    return (
      <NavbarLayout>
        <LoadingScreen message="Asking Gemma to prepare your briefing..." />
      </NavbarLayout>
    );
  }

  if (error || !data) {
    return (
      <NavbarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-(--muted-foreground)">
            Something went wrong. Please refresh the page.
          </p>
        </div>
      </NavbarLayout>
    );
  }

  return (
    <NavbarLayout>
      <div className="min-h-screen flex flex-col">
        <div className="w-full h-px bg-(--brand-secondary)" />

        <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
          <h1 className="text-5xl font-extrabold text-(--foreground) tracking-tight mb-10">
            {getGreeting()}
          </h1>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-[65%] flex flex-col">

              <SectionHeader title="Weather" />
              <WeatherCard weather={data.weather} />

              <SectionHeader title="US Stocks" />
              <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
                <div className="flex flex-col">
                  {data.stocks.us.map((stock) => (
                    <StockRow key={stock.symbol} stock={stock} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-(--muted-foreground) italic border-t border-(--border) pt-3">
                  {data.stocks.commentary}
                </p>
              </div>

              <SectionHeader title="Word of the Day" />
              <WordCard wordData={data.wordOfTheDay} />

              <SectionHeader title="Dog of the Day" />
              <DogCard dog={data.dog} />

              <SectionHeader title="Joke of the Day" />
              <JokeCard joke={data.joke} />

            </div>

            <aside className="lg:w-[35%] flex flex-col gap-8">
              <div>
                <SectionHeader title="Reminders" />
                <RemindersPanel />
              </div>

              <div>
                <SectionHeader title="World Stocks" />
                <WorldStocks stocks={data.stocks.world} />
              </div>

              <div>
                <SectionHeader title="Top News" />
                <NewsSection news={data.news} />
              </div>

              <div>
                <SectionHeader title="On This Day" />
                <OnThisDayCard events={data.onThisDay} />
              </div>
            </aside>
          </div>
        </main>

        <Footer />
      </div>
    </NavbarLayout>
  );
}