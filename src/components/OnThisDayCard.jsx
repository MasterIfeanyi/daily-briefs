export default function OnThisDayCard({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="flex gap-4 py-3 border-b border-(--border) last:border-0 last:pb-0"
          >
            <div className="shrink-0 w-16 text-center">
              <span className="text-2xl font-extrabold text-(--brand) leading-none">
                {event.year}
              </span>
            </div>
            <p className="text-sm text-(--foreground) leading-relaxed">
              {event.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}