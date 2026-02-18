require('dotenv').config();
const express = require('express');
const path = require('path');
const defaults = require('./config/defaults');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Shared state (populated by services) ---
const state = {
  weather: null,
  airQuality: null,
  hebrewDate: null,
  shabbat: { isShabbat: false, parasha: null, candleLighting: null, havdalah: null },
  alerts: { active: false, alerts: [] },
  news: [],
};

// --- Routes ---
const apiRouter = require('./routes/api');
const settingsRouter = require('./routes/settings');

app.use('/api', apiRouter(state));
app.use('/api/settings', settingsRouter);

// Serve settings page
app.get('/settings', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// --- Start services ---
const weatherService = require('./services/weather');
const airQualityService = require('./services/airquality');
const hebrewDateService = require('./services/hebrew-date');
const shabbatService = require('./services/shabbat');
const alertsService = require('./services/alerts');
const newsService = require('./services/news');

function startServices() {
  weatherService.start(state);
  airQualityService.start(state);
  hebrewDateService.start(state);
  shabbatService.start(state);
  alertsService.start(state);
  newsService.start(state);
}

app.listen(defaults.port, () => {
  console.log(`Pi Clock running on http://localhost:${defaults.port}`);
  startServices();
});
