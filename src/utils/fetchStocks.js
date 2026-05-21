// 1. Import the main class from the library
import YahooFinance from 'yahoo-finance2';

// 2. Instantiate it once outside the function so it persists across calls
const yahooFinance = new YahooFinance();

export async function fetchStocks(usTickers, worldTickers) {
  try {
    const allTickers = [...usTickers, ...worldTickers];

    // 3. Make the call using the new instance
    const results = await yahooFinance.quote(allTickers);

    const formattedStocks = results.map(stock => ({
      symbol: stock.symbol,
      name: stock.longName || stock.shortName || stock.symbol,
      price: stock.regularMarketPrice,
      change: stock.regularMarketChange,
      isUp: stock.regularMarketChange >= 0
    }));

    return {
      us: formattedStocks.filter(s => usTickers.includes(s.symbol)),
      world: formattedStocks.filter(s => worldTickers.includes(s.symbol))
    };
  } catch (error) {
    console.error("Yahoo Finance Library Error:", error);
    throw error;
  }
}