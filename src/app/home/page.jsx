"use client";

import { useState, useEffect } from "react";
import SkeletonCard from "@/components/SkeletonCard";
import WeatherCard from "@/components/WeatherCard";
import StockRow from "@/components/StockRow";
import WordCard from "@/components/WordCard";
import JokeCard from "@/components/JokeCard";
import RemindersPanel from "@/components/RemindersPanel";
import WorldStocks from "@/components/WorldStocks";
import NewsSection from "@/components/NewsSection";
import LocationPrompt from "@/components/LocationPrompt";
import NavbarLayout from "@/components/NavbarLayout";
import { getGreeting } from "@/utils/greeting";
import DogCard from "@/components/DogCard";
import OnThisDayCard from "@/components/OnThisDayCard";

// ✅ Moved outside DailyBriefing so React doesn't recreate it on every render
const SectionHeader = ({ title }) => (
  <div className="mt-8 mb-4">
    <h2 className="text-(--brand) text-sm font-extrabold uppercase tracking-widest mb-2">
      {title}
    </h2>
    <hr className="border-(--border)" />
  </div>
);

export default function DailyBriefing() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setSlowLoad(true);
    }, 8000); // after 8 seconds
    return () => clearTimeout(timer);
  }, [loading]);


  // Hook to handle onboarding geolocations automatically on boot
  useEffect(() => {
    const hasPrompted = localStorage.getItem("briefing_location_prompted");

    if (!hasPrompted && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          localStorage.setItem("briefing_location_prompted", "true");
          try {
            const saveRes = await fetch("/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              }),
            });

            if (saveRes.ok) {
              // Location sync successful! Refresh brief payload data silently
              const freshBrief = await fetch("/api/briefing");
              if (freshBrief.ok) {
                const result = await freshBrief.json();
                setData(result.data);
              }
            }
          } catch (err) {
            console.error("Auto sync location storage pipeline failed:", err);
          }
        },
        (error) => {
          console.warn("User blocked permission or device timed out:", error.message);
          localStorage.setItem("briefing_location_prompted", "true");
        }
      );
    }
  }, []);



  useEffect(() => {

    async function fetchBriefing() {
      try {
        const res = await fetch("/api/briefing", {
          credentials: "include"
        });
        if (res.ok) {
          const result = await res.json();
          setData(result.data);
        } else {
          throw new Error("API Route not found, using fallback mock data.");
        }
      } catch (err) {
        setError(true);
        setData({
          weather: { temperature: 28, sunrise: "2026-05-19T06:12", sunset: "2026-05-19T18:45", weathercode: 2 },
          stocks: {
            us: [
              { symbol: "AAPL", name: "Apple Inc.", price: 189.45, change: 1.24, isUp: true },
              { symbol: "TSLA", name: "Tesla Inc.", price: 175.22, change: -2.31, isUp: false },
              { symbol: "NVDA", name: "NVIDIA Corp.", price: 890.10, change: 4.15, isUp: true },
              { symbol: "MSFT", name: "Microsoft Corp.", price: 415.80, change: 0.85, isUp: true }
            ],
            world: [
              { symbol: "SAP.DE", name: "SAP SE", price: 182.30, change: -0.45, isUp: false },
              { symbol: "SONY.T", name: "Sony Group", price: 124.50, change: 1.10, isUp: true }
            ],
            commentary: "Markets are cautiously optimistic today."
          },
          wordOfTheDay: { word: "Ephemeral", partOfSpeech: "adjective", definition: "Lasting for a very short time.", usedInSentence: "The ephemeral beauty of the sunset left everyone speechless.", origin: "Greek: ephemeros, lasting a day." },
          joke: { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs." },
          news: [
            { title: "Real-time updates temporarily unavailable", description: "The live news stream couldn't be loaded. Check your database connections or network logs." }
          ],
          dog: {
            imageUrl: null,
            breed: 'Golden Retriever',
            funFact: 'Golden Retrievers were originally bred in Scotland in the mid-19th century.'
          },
          onThisDay: [
            { year: 1969, text: 'Apollo 11 successfully landed humans on the Moon for the first time.' },
            { year: 1990, text: 'The Hubble Space Telescope was launched into orbit.' },
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    fetchBriefing();
  }, []);


  // <LocationPrompt />

  {
    slowLoad && loading && (
      <p className="text-center text-(--muted-foreground) text-sm mb-4">
        Still loading your briefing... this can take up to 30 seconds on first load.
      </p>
    )
  }

  if (!loading && !data) {
    return (
      <NavbarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-(--muted-foreground)">Something went wrong. Please refresh the page.</p>
        </div>
      </NavbarLayout>
    );
  }

  if (slowLoad && loading) {
    return (
      <p className="text-center text-(--muted-foreground) text-sm mt-6">
        Still loading your briefing... this can take up to 30 seconds on first load.
      </p>
    )
  }

  return (

    <NavbarLayout>
      <div className="min-h-screen flex flex-col">

        <div className="w-full h-px bg-(--brand-secondary)" />

        {slowLoad && loading && (
          <p className="text-center text-(--muted-foreground) text-sm mt-6">
            Still loading your briefing... this can take up to 30 seconds on first load.
          </p>
        )}

        <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
          <h1 className="text-5xl font-extrabold text-(--foreground) tracking-tight mb-10">
            {getGreeting()}
          </h1>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-[65%] flex flex-col">

              <SectionHeader title="Weather" />
              {loading || !data?.weather ? <SkeletonCard heightClass="h-40" /> : <WeatherCard weather={data.weather} />}

              <SectionHeader title="US Stocks" />
              {loading || !data?.stocks ? (
                <SkeletonCard heightClass="h-64" />
              ) : (
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
              )}

              <SectionHeader title="Dog of the Day" />
              {loading || !data?.dog ? (
                <SkeletonCard heightClass="h-72" />
              ) : (
                <DogCard dog={data.dog} />
              )}

              <SectionHeader title="On This Day" />
              {loading || !data?.onThisDay ? (
                <SkeletonCard heightClass="h-48" />
              ) : (
                <OnThisDayCard events={data.onThisDay} />
              )}

              <SectionHeader title="Word of the Day" />
              {loading || !data?.wordOfTheDay ? <SkeletonCard heightClass="h-48" /> : <WordCard wordData={data.wordOfTheDay} />}

              <SectionHeader title="Joke of the Day" />
              {loading || !data?.joke ? <SkeletonCard heightClass="h-32" /> : <JokeCard joke={data.joke} />}
            </div>

            <aside className="lg:w-[35%] flex flex-col gap-8">
              <div>
                <SectionHeader title="Reminders" />
                <RemindersPanel />
              </div>

              <div>
                <SectionHeader title="World Stocks" />
                {loading || !data?.stocks ? <SkeletonCard heightClass="h-40" /> : <WorldStocks stocks={data.stocks.world} />}
              </div>

              <div>
                <SectionHeader title="Top News" />
                {loading || !data?.news ? (
                  <div className="space-y-4">
                    <SkeletonCard heightClass="h-28" />
                    <SkeletonCard heightClass="h-28" />
                  </div>
                ) : (
                  <NewsSection news={data.news} />
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </NavbarLayout>
  );
}