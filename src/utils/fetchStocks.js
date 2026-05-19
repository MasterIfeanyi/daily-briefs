import axios from 'axios';

export async function fetchStocks(usTickers, worldTickers) {
  const allTickers = [...usTickers, ...worldTickers].join(',');

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${allTickers}`;

  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const results = res.data.quoteResponse.result;

  const format = (quote) => ({
    symbol: quote.symbol,
    name: quote.shortName,
    price: parseFloat(quote.regularMarketPrice.toFixed(2)),
    change: parseFloat(quote.regularMarketChangePercent.toFixed(2)),
    isUp: quote.regularMarketChangePercent >= 0,
  });

  return {
    us: results
      .filter(q => usTickers.includes(q.symbol))
      .map(format),
    world: results
      .filter(q => worldTickers.includes(q.symbol))
      .map(format),
    raw: results.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChangePercent,
    })),
  };
}