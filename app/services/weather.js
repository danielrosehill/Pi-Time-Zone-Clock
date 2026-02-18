const fetch = require('node-fetch');
const config = require('../config/config');

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
  const key = config.get('openweatherApiKey');
  if (!key) return;
  try {
    const lat = config.get('latitude');
    const lon = config.get('longitude');
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
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
    setInterval(() => poll(state), config.DEFAULTS.weatherInterval);
  },
};
