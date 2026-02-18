const fetch = require('node-fetch');
const config = require('../config/config');

async function poll(state) {
  try {
    const lat = config.get('latitude');
    const lon = config.get('longitude');
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo air quality ${res.status}`);
    const data = await res.json();
    const current = data.current;

    state.airQuality = {
      aqi: current.us_aqi,
      pm25: current.pm2_5 != null ? Math.round(current.pm2_5) : null,
    };
  } catch (err) {
    console.error('Air quality poll error:', err.message);
  }
}

module.exports = {
  start(state) {
    poll(state);
    setInterval(() => poll(state), config.DEFAULTS.airQualityInterval);
  },
};
