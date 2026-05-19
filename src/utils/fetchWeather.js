import axios from 'axios';

export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m` +
    `&daily=sunrise,sunset` +
    `&timezone=auto` +
    `&forecast_days=1`;

  const res = await axios.get(url);
  const data = res.data;

  return {
    temperature: Math.round(data.current.temperature_2m),
    windspeed: data.current.windspeed_10m,
    humidity: data.current.relative_humidity_2m,
    weathercode: data.current.weathercode,
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
    timezone: data.timezone,
  };
}