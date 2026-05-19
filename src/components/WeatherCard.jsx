import { SunIcon } from "./Icons";

export default function WeatherCard({ weather }) {
    const formatTime = (isoString) => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(isoString));
    };

    return (
        <div className="bg-(--surface) border border-(--border) rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center sm:items-start">
                <span className="text-6xl font-extrabold text-(--foreground)">
                    {weather.temperature}&deg;C
                </span>
                <div className="mt-4 flex flex-row items-center space-x-6 text-(--muted-foreground) font-semibold">
                    <div className="flex items-center space-x-2">
                        <SunIcon className="w-5 h-5 text-(--warning)" />
                        <span>Sunrise: {formatTime(weather.sunrise)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <SunIcon className="w-5 h-5 text-(--brand-hover)" />
                        <span>Sunset: {formatTime(weather.sunset)}</span>
                    </div>
                </div>
                <p className="mt-4 text-(--foreground) font-semibold text-lg">
                    Current conditions: Clear and sunny
                </p>
            </div>
        </div>
    );
}