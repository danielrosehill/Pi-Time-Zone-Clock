const express = require('express');

module.exports = function (state) {
  const router = express.Router();

  // Full state endpoint — polled by dashboard
  router.get('/state', (_req, res) => {
    res.json(state);
  });

  // Per-service endpoints
  router.get('/weather', (_req, res) => res.json(state.weather));
  router.get('/airquality', (_req, res) => res.json(state.airQuality));
  router.get('/hebrew-date', (_req, res) => res.json(state.hebrewDate));
  router.get('/shabbat', (_req, res) => res.json(state.shabbat));
  router.get('/alerts', (_req, res) => res.json(state.alerts));
  router.get('/news', (_req, res) => res.json(state.news));

  return router;
};
