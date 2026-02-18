const fetch = require('node-fetch');
const config = require('../config/config');

async function poll(state) {
  if (config.get('alertsEnabled') === false) {
    state.alerts = { active: false, alerts: [] };
    return;
  }
  try {
    const url = 'https://www.oref.org.il/warningMessages/alert/Alerts.json';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.oref.org.il/',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 5000,
    });
    if (!res.ok) throw new Error(`Oref API ${res.status}`);
    const text = await res.text();

    // API returns empty string when no alerts
    if (!text || text.trim() === '') {
      state.alerts = { active: false, alerts: [] };
      return;
    }

    const data = JSON.parse(text);
    const alertList = Array.isArray(data) ? data : (data.data || []);
    state.alerts = {
      active: alertList.length > 0,
      alerts: alertList.map((a) => ({
        title: a.title || a.data,
        area: a.desc || a.data,
      })),
    };
  } catch (err) {
    // Don't log on every cycle — oref may be unreachable outside Israel
    if (state.alerts.active) {
      console.error('Alerts poll error:', err.message);
    }
  }
}

module.exports = {
  start(state) {
    poll(state);
    const interval = (config.get('alertsInterval') || 60) * 1000;
    setInterval(() => poll(state), interval);
  },
};
