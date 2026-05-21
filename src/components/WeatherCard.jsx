import { SunIcon } from "./Icons";

export default function WeatherCard({ weather }) {

    const getCondition = (code) => {
        if (code === null || code === undefined) return 'Conditions unavailable';
        if (code === 0) return 'Clear and sunny';
        if (code <= 2) return 'Partly cloudy';
        if (code === 3) return 'Overcast';
        if (code <= 49) return 'Foggy';
        if (code <= 59) return 'Drizzling';
        if (code <= 69) return 'Rainy';
        if (code <= 79) return 'Snowy';
        if (code <= 84) return 'Rain showers';
        if (code <= 94) return 'Thunderstorm';
        return 'Stormy';
    };

    const formatTime = (isoString) => {
        if (!isoString) return "N/A";
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
                    Current conditions: {getCondition(weather.weathercode)}
                </p>
            </div>
        </div>
    );
}