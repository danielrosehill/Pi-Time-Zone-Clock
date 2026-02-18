const fetch = require('node-fetch');
const config = require('../config/config');

async function poll(state) {
  const key = config.get('iqairApiKey');
  if (!key) return;
  try {
    const lat = config.get('latitude');
    const lon = config.get('longitude');
    const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`IQAir API ${res.status}`);
    const data = await res.json();
    const pollution = data.data.current.pollution;
    state.airQuality = {
      aqi: pollution.aqius,
      pm25: pollution.p2 ? pollution.p2.conc : null,
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
