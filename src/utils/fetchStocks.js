export async function fetchStocks(usTickers, worldTickers) {
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

  const usList = usTickers || ['AAPL', 'TSLA', 'NVDA', 'MSFT'];
  const worldList = worldTickers || ['NESN.SW', 'SONY.T', 'SAP.DE'];
  const allTickers = [...usList, ...worldList];

  const fetchQuote = async (symbol) => {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const data = await res.json();
    return { symbol, data };
  };

  const fetchProfile = async (symbol) => {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const data = await res.json();
    return { symbol, name: data.name || symbol };
  };

  const [quotes, profiles] = await Promise.all([
    Promise.all(allTickers.map(fetchQuote)),
    Promise.all(allTickers.map(fetchProfile)),
  ]);

  const nameMap = {};
  profiles.forEach(p => { nameMap[p.symbol] = p.name; });

  const format = (q) => ({
    symbol: q.symbol,
    name: nameMap[q.symbol] || q.symbol,
    price: parseFloat(q.data.c.toFixed(2)),
    change: parseFloat(q.data.dp.toFixed(2)),
    isUp: q.data.dp >= 0,
  });

  return {
    us: quotes.filter(q => usList.includes(q.symbol)).map(format),
    world: quotes.filter(q => worldList.includes(q.symbol)).map(format),
    raw: quotes.map(q => ({
      symbol: q.symbol,
      price: q.data.c,
      change: q.data.dp,
    })),
  };
}