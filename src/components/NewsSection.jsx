export default function NewsSection({ news }) {
  const fallbackNews = [
    { id: 1, title: "Global Markets Rally", description: "Indexes reach record highs following positive tech earnings and steady job growth data." },
    { id: 2, title: "Space Telescope Discovers Exoplanet", description: "Astronomers have found a potentially habitable world located 40 light-years away." },
    { id: 3, title: "Breakthrough in Renewable Energy", description: "Scientists announce a new high-efficiency solar panel technology ready for mass production." }
  ];

  const displayNews = news && news.length > 0 ? news : fallbackNews;

  return (
    <div className="flex flex-col gap-4">
      {displayNews.slice(0, 3).map((item) => (
        <div key={item.id || item.title} className="bg-surface border border-border rounded-xl p-4 shadow-sm">
          <h4 className="font-extrabold text-foreground mb-1">{item.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}