const fetch = require('node-fetch');
const config = require('../config/config');

// WMO weather code → emoji mapping
const WMO_ICONS = {
  0: ['☀️', '🌙'],   // Clear sky
  1: ['🌤️', '🌙'],   // Mainly clear
  2: ['⛅', '☁️'],    // Partly cloudy
  3: ['☁️', '☁️'],    // Overcast
  45: ['🌫️', '🌫️'],  // Fog
  48: ['🌫️', '🌫️'],  // Rime fog
  51: ['🌧️', '🌧️'],  // Light drizzle
  53: ['🌧️', '🌧️'],  // Moderate drizzle
  55: ['🌧️', '🌧️'],  // Dense drizzle
  56: ['🌧️', '🌧️'],  // Freezing drizzle
  57: ['🌧️', '🌧️'],  // Dense freezing drizzle
  61: ['🌧️', '🌧️'],  // Slight rain
  63: ['🌧️', '🌧️'],  // Moderate rain
  65: ['🌧️', '🌧️'],  // Heavy rain
  66: ['🌧️', '🌧️'],  // Freezing rain
  67: ['🌧️', '🌧️'],  // Heavy freezing rain
  71: ['🌨️', '🌨️'],  // Slight snow
  73: ['🌨️', '🌨️'],  // Moderate snow
  75: ['🌨️', '🌨️'],  // Heavy snow
  77: ['🌨️', '🌨️'],  // Snow grains
  80: ['🌦️', '🌧️'],  // Slight rain showers
  81: ['🌦️', '🌧️'],  // Moderate rain showers
  82: ['🌦️', '🌧️'],  // Violent rain showers
  85: ['🌨️', '🌨️'],  // Slight snow showers
  86: ['🌨️', '🌨️'],  // Heavy snow showers
  95: ['⛈️', '⛈️'],   // Thunderstorm
  96: ['⛈️', '⛈️'],   // Thunderstorm + hail
  99: ['⛈️', '⛈️'],   // Thunderstorm + heavy hail
};

async function poll(state) {
  try {
    const lat = config.get('latitude');
    const lon = config.get('longitude');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo weather ${res.status}`);
    const data = await res.json();
    const current = data.current;

    const code = current.weather_code;
    const isDay = current.is_day === 1 ? 0 : 1; // index: 0=day, 1=night
    const icons = WMO_ICONS[code] || ['🌡️', '🌡️'];

    state.weather = {
      temp: Math.round(current.temperature_2m),
      icon: icons[isDay],
      description: '',
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
