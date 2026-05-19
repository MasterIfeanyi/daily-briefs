export async function fetchNews() {
  try {
    // Using a reliable, free news API aggregation endpoint
    const res = await fetch('https://newsapi.org/v2/top-headlines?language=en&pageSize=10', {
      headers: {
        'X-Api-Key': process.env.NEWS_API_KEY // Sign up for a free key at newsapi.org
      },
      next: { revalidate: 3600 } // Cache raw headlines for 1 hour
    });

    if (!res.ok) throw new Error('Failed to fetch real-world news headlines');
    
    const json = await res.json();
    
    // Extract only the raw unformatted data arrays to feed into the AI
    return (json.articles || []).map(article => ({
      source: article.source?.name || 'Global News',
      title: article.title,
      description: article.description || article.content || ''
    }));
  } catch (error) {
    console.error("News Retrieval Error:", error);
    return []; // Return empty array so the rest of the briefing doesn't crash
  }
}