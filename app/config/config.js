const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// All configuration defaults in one place
const DEFAULTS = {
  // Server
  port: 3000,

  // Location
  latitude: 31.77,
  longitude: 35.23,
  geonameId: 281184,
  timezone: 'Asia/Jerusalem',

  // Display
  layout: 'classic',
  bottomBarMode: 'auto',
  use24hr: true,
  alertsEnabled: true,
  alertsInterval: 60,
  newsRssUrl: 'https://www.timesofisrael.com/feed/',

  // Poll intervals (ms) — not user-configurable, internal only
  weatherInterval: 15 * 60 * 1000,
  airQualityInterval: 30 * 60 * 1000,
  hebrewDateInterval: 60 * 60 * 1000,
  shabbatDataInterval: 6 * 60 * 60 * 1000,
  shabbatCheckInterval: 60 * 1000,
  _alertsPollInterval: 60 * 1000,
  newsInterval: 15 * 60 * 1000,
};

// Maps environment variable names to config keys with type parsers
const ENV_MAP = {
  PORT: { key: 'port', parse: (v) => parseInt(v, 10) },
  LATITUDE: { key: 'latitude', parse: parseFloat },
  LONGITUDE: { key: 'longitude', parse: parseFloat },
  GEONAME_ID: { key: 'geonameId', parse: (v) => parseInt(v, 10) },
  TIMEZONE: { key: 'timezone', parse: String },
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading settings.json:', err.message);
  }
  return {};
}

function writeJsonFile(data) {
  ensureDataDir();
  const tmp = SETTINGS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, SETTINGS_FILE);
}

/**
 * Get a single config value.
 * Priority: process.env > settings.json > DEFAULTS
 */
function get(key) {
  // Check env vars first
  for (const [envName, mapping] of Object.entries(ENV_MAP)) {
    if (mapping.key === key && process.env[envName]) {
      return mapping.parse(process.env[envName]);
    }
  }

  // Check JSON file
  const fileData = readJsonFile();
  if (key in fileData) {
    return fileData[key];
  }

  // Fall back to defaults
  return DEFAULTS[key];
}

/**
 * Get all config values merged: defaults < JSON file < env vars.
 */
function getAll() {
  const fileData = readJsonFile();
  const merged = { ...DEFAULTS, ...fileData };

  // Overlay env vars
  for (const [envName, mapping] of Object.entries(ENV_MAP)) {
    if (process.env[envName]) {
      merged[mapping.key] = mapping.parse(process.env[envName]);
    }
  }

  return merged;
}

/**
 * Update settings — merges partial into existing JSON file and writes atomically.
 */
function update(partial) {
  const fileData = readJsonFile();
  const updated = { ...fileData, ...partial };
  writeJsonFile(updated);
  return { ...DEFAULTS, ...updated };
}

/**
 * On first run (no settings.json), seed the file from current env vars
 * so the user can see them in the settings UI.
 */
function seedFromEnv() {
  if (fs.existsSync(SETTINGS_FILE)) return;

  const seed = {};
  for (const [envName, mapping] of Object.entries(ENV_MAP)) {
    if (process.env[envName]) {
      seed[mapping.key] = mapping.parse(process.env[envName]);
    }
  }

  if (Object.keys(seed).length > 0) {
    console.log('Seeding settings.json from environment variables');
    writeJsonFile(seed);
  }
}

module.exports = { DEFAULTS, get, getAll, update, seedFromEnv };
