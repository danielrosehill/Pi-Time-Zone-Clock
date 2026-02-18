const express = require('express');
const config = require('../config/config');

const router = express.Router();

// Keys that contain secrets — mask in GET responses
const SECRET_KEYS = ['openweatherApiKey', 'iqairApiKey'];

// Keys that are internal-only and should not appear in the settings UI
const INTERNAL_KEYS = [
  'weatherInterval', 'airQualityInterval', 'hebrewDateInterval',
  'shabbatDataInterval', 'shabbatCheckInterval', '_alertsPollInterval',
  'newsInterval', 'port',
];

function maskSecret(value) {
  if (!value || typeof value !== 'string' || value.length === 0) return '';
  if (value.length <= 4) return '****';
  return '****' + value.slice(-4);
}

router.get('/', (_req, res) => {
  const all = config.getAll();

  // Remove internal keys
  for (const key of INTERNAL_KEYS) {
    delete all[key];
  }

  // Mask secrets
  for (const key of SECRET_KEYS) {
    if (all[key]) {
      all[key] = maskSecret(all[key]);
    }
  }

  res.json(all);
});

router.post('/', (req, res) => {
  const body = { ...req.body };

  // Don't save masked placeholder values back — only save if user typed a real key
  for (const key of SECRET_KEYS) {
    if (key in body) {
      const val = body[key];
      if (!val || val.startsWith('****')) {
        delete body[key];
      }
    }
  }

  const updated = config.update(body);

  // Mask secrets in response
  for (const key of SECRET_KEYS) {
    if (updated[key]) {
      updated[key] = maskSecret(updated[key]);
    }
  }

  // Remove internal keys from response
  for (const key of INTERNAL_KEYS) {
    delete updated[key];
  }

  res.json(updated);
});

module.exports = router;
