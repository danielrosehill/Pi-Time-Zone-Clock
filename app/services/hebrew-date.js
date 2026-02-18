const fetch = require('node-fetch');
const defaults = require('../config/defaults');

function todayString() {
  // Get today's date in Jerusalem timezone
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: defaults.timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(now); // YYYY-MM-DD
}

async function poll(state) {
  try {
    const date = todayString();
    const url = `https://www.hebcal.com/converter?cfg=json&date=${date}&g2h=1&gs=on`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Hebcal converter ${res.status}`);
    const data = await res.json();
    state.hebrewDate = {
      hebrew: data.hebrew,
      heDateParts: {
        day: data.hd,
        month: data.hm,
        year: data.hy,
      },
    };
  } catch (err) {
    console.error('Hebrew date poll error:', err.message);
  }
}

module.exports = {
  start(state) {
    poll(state);
    setInterval(() => poll(state), defaults.hebrewDateInterval);
  },
};
