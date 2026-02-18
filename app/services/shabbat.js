const fetch = require('node-fetch');
const defaults = require('../config/defaults');

let shabbatData = null; // cached weekly data

async function fetchWeeklyData() {
  try {
    const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=off&mod=off&nx=off&c=on&M=on&s=on&geo=geoname&geonameid=${defaults.geonameId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Hebcal shabbat ${res.status}`);
    const data = await res.json();

    // Extract candle lighting, havdalah, and parasha from items
    let candleLighting = null;
    let havdalah = null;
    let parasha = null;

    for (const item of data.items) {
      if (item.category === 'candles') {
        candleLighting = item.date; // ISO datetime string
        if (!item.memo) continue;
      }
      if (item.category === 'havdalah') {
        havdalah = item.date;
      }
      if (item.category === 'parashat') {
        parasha = item.title; // e.g., "Parashat Terumah"
      }
    }

    shabbatData = { candleLighting, havdalah, parasha };
  } catch (err) {
    console.error('Shabbat data fetch error:', err.message);
  }
}

function checkShabbatMode(state) {
  if (!shabbatData || !shabbatData.candleLighting || !shabbatData.havdalah) {
    state.shabbat.isShabbat = false;
    return;
  }

  const now = new Date();
  const start = new Date(shabbatData.candleLighting);
  const end = new Date(shabbatData.havdalah);

  state.shabbat.isShabbat = now >= start && now <= end;
  state.shabbat.parasha = shabbatData.parasha;
  state.shabbat.candleLighting = shabbatData.candleLighting;
  state.shabbat.havdalah = shabbatData.havdalah;

  // Format times for display (HH:MM)
  const fmtOpts = { timeZone: defaults.timezone, hour: '2-digit', minute: '2-digit', hour12: false };
  state.shabbat.candleLightingTime = new Intl.DateTimeFormat('en-GB', fmtOpts).format(start);
  state.shabbat.havdalahTime = new Intl.DateTimeFormat('en-GB', fmtOpts).format(end);
}

module.exports = {
  start(state) {
    fetchWeeklyData().then(() => checkShabbatMode(state));
    setInterval(() => fetchWeeklyData(), defaults.shabbatDataInterval);
    setInterval(() => checkShabbatMode(state), defaults.shabbatCheckInterval);
  },
};
