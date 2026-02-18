const fetch = require('node-fetch');
const defaults = require('../config/defaults');

async function poll(state) {
  const key = process.env.IQAIR_API_KEY;
  if (!key) return;
  try {
    const url = `https://api.airvisual.com/v2/nearest_city?lat=${defaults.latitude}&lon=${defaults.longitude}&key=${key}`;
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
    setInterval(() => poll(state), defaults.airQualityInterval);
  },
};
