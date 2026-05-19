"use client";

import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@/components/Icons";
import SkeletonCard from "@/components/SkeletonCard";
import WeatherCard from "@/components/WeatherCard";
import StockRow from "@/components/StockRow";
import WordCard from "@/components/WordCard";
import JokeCard from "@/components/JokeCard";
import RemindersPanel from "@/components/RemindersPanel";
import WorldStocks from "@/components/WorldStocks";
import NewsSection from "@/components/NewsSection";
import LocationPrompt from "@/components/LocationPrompt";

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

  // ✅ Read the DOM and compute the date once at mount time, not inside an effect
  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark"
  );
  const [currentDate] = useState(
    () => new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(new Date())
  );

  useEffect(() => {

    async function fetchBriefing() {
      try {
        const res = await fetch("/api/briefing");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          throw new Error("API Route not found, using fallback mock data.");
        }
      } catch (err) {
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
          joke: { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs." }
        });
      } finally {
        setLoading(false);
      }
    }
    fetchBriefing();
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    document.cookie = `theme=${newTheme};path=/;max-age=31536000`;
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--brand)] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-extrabold tracking-tight">Daily Briefing</h1>
        <div className="flex items-center space-x-6">
          <span className="font-semibold text-sm hidden sm:block">{currentDate}</span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="w-full h-px bg-[var(--brand-secondary)]" />

      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
        <h1 className="text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-10">
          Good morning.
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-[65%] flex flex-col">
            <LocationPrompt />

            <SectionHeader title="Weather" />
            {loading ? <SkeletonCard heightClass="h-40" /> : <WeatherCard weather={data.weather} />}

            <SectionHeader title="US Stocks" />
            {loading ? (
              <SkeletonCard heightClass="h-64" />
            ) : (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm">
                <div className="flex flex-col">
                  {data.stocks.us.map((stock) => (
                    <StockRow key={stock.symbol} stock={stock} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-[var(--muted-foreground)] italic border-t border-[var(--border)] pt-3">
                  {data.stocks.commentary}
                </p>
              </div>
            )}

            <SectionHeader title="Word of the Day" />
            {loading ? <SkeletonCard heightClass="h-48" /> : <WordCard wordData={data.wordOfTheDay} />}

            <SectionHeader title="Joke of the Day" />
            {loading ? <SkeletonCard heightClass="h-32" /> : <JokeCard joke={data.joke} />}
          </div>

          <aside className="lg:w-[35%] flex flex-col gap-8">
            <div>
              <SectionHeader title="Reminders" />
              <RemindersPanel />
            </div>

            <div>
              <SectionHeader title="World Stocks" />
              {loading ? <SkeletonCard heightClass="h-40" /> : <WorldStocks stocks={data.stocks.world} />}
            </div>

            <div>
              <SectionHeader title="Top News" />
              {loading ? (
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
  );
}