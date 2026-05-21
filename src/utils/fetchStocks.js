export async function fetchStocks(usTickers, worldTickers) {
  const FMP_API_KEY = process.env.FMP_API_KEY;

  const allTickers = [...(usTickers || ['AAPL', 'TSLA', 'NVDA', 'MSFT']), ...(worldTickers || ['NESN.SW', 'SONY.T', 'SAP.DE'])];

  const url = `https://financialmodelingprep.com/api/v3/quote/${allTickers.join(',')}?apikey=${FMP_API_KEY}`;

  const res = await fetch(url);
  const results = await res.json();

  if (!Array.isArray(results)) {
    throw new Error('FMP API returned unexpected response: ' + JSON.stringify(results));
  }

  const usList = usTickers || ['AAPL', 'TSLA', 'NVDA', 'MSFT'];
  const worldList = worldTickers || ['NESN.SW', 'SONY.T', 'SAP.DE'];

  const format = (q) => ({
    symbol: q.symbol,
    name: q.name,
    price: parseFloat(q.price.toFixed(2)),
    change: parseFloat(q.changesPercentage.toFixed(2)),
    isUp: q.changesPercentage >= 0,
  });

  return {
    us: results.filter(q => usList.includes(q.symbol)).map(format),
    world: results.filter(q => worldList.includes(q.symbol)).map(format),
    raw: results.map(q => ({
      symbol: q.symbol,
      price: q.price,
      change: q.changesPercentage,
    })),
  };
}