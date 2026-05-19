import StockRow from "./StockRow";

export default function WorldStocks({ stocks }) {
  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col">
        {stocks.map((stock) => (
          <StockRow key={stock.symbol} stock={stock} />
        ))}
      </div>
    </div>
  );
}