module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  latitude: parseFloat(process.env.LATITUDE) || 31.77,
  longitude: parseFloat(process.env.LONGITUDE) || 35.23,
  geonameId: parseInt(process.env.GEONAME_ID, 10) || 281184,
  timezone: process.env.TIMEZONE || 'Asia/Jerusalem',

  // Poll intervals (ms)
  weatherInterval: 15 * 60 * 1000,      // 15 min
  airQualityInterval: 30 * 60 * 1000,   // 30 min
  hebrewDateInterval: 60 * 60 * 1000,   // 1 hr
  shabbatDataInterval: 6 * 60 * 60 * 1000, // 6 hr
  shabbatCheckInterval: 60 * 1000,       // 60s mode check
  alertsInterval: 60 * 1000,            // 60s
  newsInterval: 5 * 60 * 1000,          // 5 min
};
