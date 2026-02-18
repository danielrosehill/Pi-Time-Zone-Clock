const express = require('express');
const config = require('../config/config');

const router = express.Router();

// Keys that are internal-only and should not appear in the settings UI
const INTERNAL_KEYS = [
  'weatherInterval', 'airQualityInterval', 'hebrewDateInterval',
  'shabbatDataInterval', 'shabbatCheckInterval', '_alertsPollInterval',
  'newsInterval', 'port',
];

function stripInternal(obj) {
  for (const key of INTERNAL_KEYS) {
    delete obj[key];
  }
  return obj;
}

router.get('/', (_req, res) => {
  res.json(stripInternal(config.getAll()));
});

router.post('/', (req, res) => {
  const updated = config.update(req.body);
  res.json(stripInternal(updated));
});

module.exports = router;
