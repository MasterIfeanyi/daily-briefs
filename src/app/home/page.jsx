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

export default function DailyBriefing() {
  const [fastData, setFastData] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [fastLoading, setFastLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);
  const [rawNews, setRawNews] = useState(null);

  useEffect(() => {
    async function loadBriefing() {
      try {
        const dataRes = await fetch('/api/briefing/data', {
          credentials: 'include',
        });
        const dataJson = await dataRes.json();

        if (!dataJson.success) throw new Error(dataJson.error);

        setFastData(dataJson.data);
        setRawNews(dataJson.rawNews || null);
        setFastLoading(false);

        if (dataJson.aiContent) {
          setAiContent(dataJson.aiContent);
          setAiLoading(false);
          return;
        }

        try {
          const genRes = await fetch('/api/briefing/generate', {
            credentials: 'include',
          });
          const genJson = await genRes.json();

          if (!genJson.success) throw new Error(genJson.error);

          setAiContent(genJson.aiContent);
        } catch (aiErr) {
          console.error('AI generation failed:', aiErr.message);
          setAiError(true);
        } finally {
          setAiLoading(false);
        }

      } catch (err) {
        console.error('Fast data fetch failed:', err.message);
        setFastLoading(false);
        setAiLoading(false);
      }
    }

    loadBriefing();
  }, []);

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

  const stockCommentary = aiContent?.stockCommentary || null;
  const news = aiContent?.news || null;

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
              {fastLoading
                ? <SkeletonCard heightClass="h-40" />
                : <WeatherCard weather={fastData.weather} />
              }

              <SectionHeader title="US Stocks" />
              {fastLoading ? (
                <SkeletonCard heightClass="h-64" />
              ) : (
                <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col">
                    {fastData.stocks.us.map((stock) => (
                      <StockRow key={stock.symbol} stock={stock} />
                    ))}
                  </div>
                  {aiLoading ? (
                    <p className="mt-4 text-sm text-(--muted-foreground) italic border-t border-(--border) pt-3 animate-pulse">
                      Analysing markets...
                    </p>
                  ) : (
                    <p className="mt-4 text-sm text-(--muted-foreground) italic border-t border-(--border) pt-3">
                      {stockCommentary || 'Market commentary unavailable.'}
                    </p>
                  )}
                </div>
              )}

              <SectionHeader title="Word of the Day" />
{fastLoading || fastData?.wordOfTheDay === undefined ? (
  <SkeletonCard heightClass="h-48" />
) : !fastData?.wordOfTheDay ? (
  <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
    <p className="text-sm text-(--muted-foreground)">
      Word of the day could not be loaded today.
    </p>
  </div>
) : (
  <WordCard wordData={fastData.wordOfTheDay} />
)}

<SectionHeader title="Joke of the Day" />
{fastLoading || fastData?.joke === undefined ? (
  <SkeletonCard heightClass="h-32" />
) : !fastData?.joke ? (
  <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
    <p className="text-sm text-(--muted-foreground)">
      No joke today. The internet is being serious.
    </p>
  </div>
) : (
  <JokeCard joke={fastData.joke} />
)}

              <SectionHeader title="Dog of the Day" />
              {fastLoading || !fastData?.dog
                ? <SkeletonCard heightClass="h-80" />
                : <DogCard dog={fastData.dog} />
              }
            </div>

            <aside className="lg:w-[35%] flex flex-col gap-8">
              <div>
                <SectionHeader title="Reminders" />
                <RemindersPanel />
              </div>

              <div>
                <SectionHeader title="World Stocks" />
                {fastLoading
                  ? <SkeletonCard heightClass="h-40" />
                  : <WorldStocks stocks={fastData.stocks.world} />
                }
              </div>

              <div>
                <SectionHeader title="Top News" />
                {aiLoading ? (
                  <div className="space-y-4">
                    <SkeletonCard heightClass="h-28" />
                    <SkeletonCard heightClass="h-28" />
                    <SkeletonCard heightClass="h-28" />
                  </div>
                ) : (
                  <NewsSection news={news || rawNews || []} />
                )}
              </div>

              <SectionHeader title="On This Day" />
              {fastLoading || !fastData?.onThisDay
                ? <SkeletonCard heightClass="h-48" />
                : <OnThisDayCard events={fastData.onThisDay} />
              }
            </aside>
          </div>
        </main>

        <Footer />
      </div>
    </NavbarLayout>
  );
}