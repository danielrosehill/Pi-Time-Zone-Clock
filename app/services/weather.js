const fetch = require('node-fetch');
const defaults = require('../config/defaults');

// Weather icon mapping (OWM icon code → emoji)
const ICON_MAP = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '🌨️', '13n': '🌨️',
  '50d': '🌫️', '50n': '🌫️',
};

async function poll(state) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${defaults.latitude}&lon=${defaults.longitude}&units=metric&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API ${res.status}`);
    const data = await res.json();
    state.weather = {
      temp: Math.round(data.main.temp),
      icon: ICON_MAP[data.weather[0].icon] || '🌡️',
      description: data.weather[0].description,
    };
  } catch (err) {
    console.error('Weather poll error:', err.message);
  }
}

module.exports = {
  start(state) {
    poll(state);
    setInterval(() => poll(state), defaults.weatherInterval);
  },
};
