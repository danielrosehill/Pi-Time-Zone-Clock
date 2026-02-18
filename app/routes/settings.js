const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  bottomBarMode: 'auto',        // 'auto' | 'news' | 'shabbat'
  alertsEnabled: true,
  alertsInterval: 60,           // seconds
  newsRssUrl: 'https://www.timesofisrael.com/feed/',
  use24hr: true,
  latitude: 31.77,
  longitude: 35.23,
  geonameId: 281184,
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getSettings() {
  ensureDataDir();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error reading settings:', err.message);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

router.get('/', (_req, res) => {
  res.json(getSettings());
});

router.post('/', (req, res) => {
  const current = getSettings();
  const updated = { ...current, ...req.body };
  saveSettings(updated);
  res.json(updated);
});

module.exports = router;
module.exports.getSettings = getSettings;
module.exports.saveSettings = saveSettings;
