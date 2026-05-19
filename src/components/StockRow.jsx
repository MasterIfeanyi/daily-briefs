import { ArrowUpIcon, ArrowDownIcon } from "./Icons";

export default function StockRow({ stock }) {
  const isUp = stock.isUp;
  const colorClass = isUp ? "text-[var(--success)]" : "text-[var(--error)]";

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <span className="font-extrabold text-foreground">{stock.symbol}</span>
        <span className="ml-2 text-sm text-muted-foreground">{stock.name}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-semibold text-foreground">${stock.price.toFixed(2)}</span>
        <div className={`flex items-center text-sm font-bold ${colorClass}`}>
          {isUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
          <span>{Math.abs(stock.change)}%</span>
        </div>
      </div>
    </div>
  );
}