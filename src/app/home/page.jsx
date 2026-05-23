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

// A small reusable component to show when an AI card fails to load
const AiErrorCard = ({ message }) => (
  <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
    <p className="text-sm text-(--muted-foreground)">
      {message || "This section could not be loaded today."}
    </p>
  </div>
);

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
  const [timezone, setTimezone] = useState('UTC');

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

        // Save the timezone so the greeting can use the user's local time
        if (dataJson.timezone) {
          setTimezone(dataJson.timezone);
        }

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
  const wordOfTheDay = aiContent?.wordOfTheDay || null;
  const joke = aiContent?.joke || null;
  const dogFunFact = aiContent?.dogFunFact || null;
  const weatherTip = aiContent?.weatherTip || null;
  const onThisDay = aiContent?.onThisDay || null;

  return (
    <NavbarLayout>
      <div className="min-h-screen flex flex-col">
        <div className="w-full h-px bg-(--brand-secondary)" />

        <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
          {/* Greeting now uses the user's actual timezone */}
          <h1 className="text-5xl font-extrabold text-(--foreground) tracking-tight mb-10">
            {getGreeting(timezone)}
          </h1>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-[65%] flex flex-col">

              <SectionHeader title="Weather" />
              {fastLoading ? (
                <SkeletonCard heightClass="h-40" />
              ) : !fastData?.weather ? (
                <AiErrorCard message="Weather data could not be loaded today." />
              ) : (
                <>
                  <WeatherCard weather={fastData.weather} />
                  {/* Weather tip sits below the weather card */}
                  {aiLoading ? (
                    <p className="mt-3 text-sm text-(--muted-foreground) italic animate-pulse">
                      Getting a tip for your day...
                    </p>
                  ) : weatherTip ? (
                    <p className="mt-3 text-sm text-(--muted-foreground) italic">
                      {weatherTip}
                    </p>
                  ) : null}
                </>
              )}

              <SectionHeader title="US Stocks" />
              {fastLoading ? (
                <SkeletonCard heightClass="h-64" />
              ) : !fastData?.stocks?.us ? (
                <AiErrorCard message="Stock data could not be loaded today." />
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
                  ) : stockCommentary ? (
                    <p className="mt-4 text-sm text-(--muted-foreground) italic border-t border-(--border) pt-3">
                      {stockCommentary}
                    </p>
                  ) : aiError ? (
                    <p className="mt-4 text-sm text-(--muted-foreground) italic border-t border-(--border) pt-3">
                      Market commentary could not be generated today.
                    </p>
                  ) : null}
                </div>
              )}

              <SectionHeader title="Word of the Day" />
              {aiLoading ? (
                <SkeletonCard heightClass="h-48" />
              ) : wordOfTheDay ? (
                <WordCard wordData={wordOfTheDay} />
              ) : (
                <AiErrorCard message="Word of the day could not be generated today." />
              )}

              <SectionHeader title="Joke of the Day" />
              {aiLoading ? (
                <SkeletonCard heightClass="h-32" />
              ) : joke ? (
                <JokeCard joke={joke} />
              ) : (
                <AiErrorCard message="No joke today. Even the AI is feeling serious." />
              )}

              <SectionHeader title="Dog of the Day" />
              {fastLoading ? (
                <SkeletonCard heightClass="h-80" />
              ) : !fastData?.dog?.imageUrl ? (
                <AiErrorCard message="Could not fetch a dog today. They must all be busy." />
              ) : (
                <DogCard dog={{ ...fastData.dog, funFact: dogFunFact }} />
              )}
            </div>

            <aside className="lg:w-[35%] flex flex-col gap-8">
              <div>
                <SectionHeader title="Reminders" />
                <RemindersPanel />
              </div>

              <div>
                <SectionHeader title="World Stocks" />
                {fastLoading ? (
                  <SkeletonCard heightClass="h-40" />
                ) : !fastData?.stocks?.world ? (
                  <AiErrorCard message="World stock data could not be loaded today." />
                ) : (
                  <WorldStocks stocks={fastData.stocks.world} />
                )}
              </div>

              <div>
                <SectionHeader title="Top News" />
                {aiLoading ? (
                  <div className="space-y-4">
                    <SkeletonCard heightClass="h-28" />
                    <SkeletonCard heightClass="h-28" />
                    <SkeletonCard heightClass="h-28" />
                  </div>
                ) : news && news.length > 0 ? (
                  <NewsSection news={news} />
                ) : rawNews && rawNews.length > 0 ? (
                  // Fallback: show raw headlines if AI failed but we have raw data
                  <NewsSection news={rawNews} />
                ) : (
                  <AiErrorCard message="Top news could not be loaded today." />
                )}
              </div>

              <div>
                <SectionHeader title="On This Day" />
                {aiLoading ? (
                  <SkeletonCard heightClass="h-48" />
                ) : onThisDay && onThisDay.length > 0 ? (
                  <OnThisDayCard events={onThisDay} />
                ) : (
                  <AiErrorCard message="Historical events could not be generated today." />
                )}
              </div>
            </aside>
          </div>
        </main>

        <Footer />
      </div>
    </NavbarLayout>
  );
}