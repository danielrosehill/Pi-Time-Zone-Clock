// Dashboard: polls /api/state every 10s, updates DOM, handles mode switching
(function () {
  const POLL_INTERVAL = 10000;
  const HEADLINE_CYCLE_INTERVAL = 60000; // cycle headline once per minute
  let currentHeadlineIdx = 0;
  let headlines = [];
  let newsSource = '';

  // DOM refs
  const $temp = document.getElementById('temp');
  const $weatherIcon = document.getElementById('weather-icon');
  const $aqiValue = document.getElementById('aqi-value');
  const $pm25Value = document.getElementById('pm25-value');
  const $hebrewDate = document.getElementById('hebrew-date');
  const $alertSection = document.getElementById('alert-section');
  const $alertText = document.getElementById('alert-text');
  const $newsSection = document.getElementById('news-section');
  const $newsHeadline = document.getElementById('news-headline');
  const $shabbatSection = document.getElementById('shabbat-section');
  const $shabbatInfo = document.getElementById('shabbat-info');

  function updateWeather(weather) {
    if (!weather) return;
    $temp.textContent = `${weather.temp}°`;
    $weatherIcon.textContent = weather.icon;
  }

  function updateAirQuality(aq) {
    if (!aq) return;
    $aqiValue.textContent = aq.aqi;
    $pm25Value.textContent = aq.pm25 != null ? aq.pm25 : '--';
  }

  function updateHebrewDate(hd) {
    if (!hd) return;
    $hebrewDate.textContent = `${hd.heDateParts.month} ${hd.heDateParts.day}`.toUpperCase();
  }

  function updateAlerts(alerts) {
    if (alerts && alerts.active && alerts.alerts.length > 0) {
      $alertSection.classList.remove('hidden');
      const first = alerts.alerts[0];
      $alertText.textContent = first.area || first.title;
    } else {
      $alertSection.classList.add('hidden');
    }
  }

  function extractSourceName(rssUrl) {
    try {
      const host = new URL(rssUrl).hostname.replace(/^www\./, '');
      // Extract readable name from domain (e.g. "timesofisrael.com" → "Times of Israel")
      const known = {
        'timesofisrael.com': 'Times of Israel',
        'jpost.com': 'Jerusalem Post',
        'haaretz.com': 'Haaretz',
        'ynetnews.com': 'Ynet',
        'israelnationalnews.com': 'Arutz Sheva',
        'i24news.tv': 'i24',
      };
      return known[host] || host;
    } catch {
      return '';
    }
  }

  function showCurrentHeadline() {
    if (headlines.length === 0) return;
    currentHeadlineIdx = currentHeadlineIdx % headlines.length;
    const title = headlines[currentHeadlineIdx].title;
    const suffix = newsSource ? ` [${newsSource}]` : '';
    $newsHeadline.textContent = title + suffix;
    currentHeadlineIdx = (currentHeadlineIdx + 1) % headlines.length;
  }

  function updateNews(news) {
    if (!news || news.length === 0) return;
    headlines = news;
  }

  function updateBottomBar(state, settings) {
    const mode = (settings && settings.bottomBarMode) || 'auto';
    let showShabbat = false;

    if (mode === 'shabbat') {
      showShabbat = true;
    } else if (mode === 'news') {
      showShabbat = false;
    } else {
      showShabbat = state.shabbat && state.shabbat.isShabbat;
    }

    if (showShabbat && state.shabbat) {
      $newsSection.classList.add('hidden');
      $shabbatSection.classList.remove('hidden');
      const parasha = state.shabbat.parasha || '---';
      const inTime = state.shabbat.candleLightingTime || '--:--';
      const outTime = state.shabbat.havdalahTime || '--:--';
      $shabbatInfo.textContent = `${parasha} | IN: ${inTime} | OUT: ${outTime}`;
    } else {
      $shabbatSection.classList.add('hidden');
      $newsSection.classList.remove('hidden');
      updateNews(state.news);
    }
  }

  async function poll() {
    try {
      const [stateRes, settingsRes] = await Promise.all([
        fetch('/api/state'),
        fetch('/api/settings'),
      ]);
      const state = await stateRes.json();
      const settings = await settingsRes.json();

      // Extract news source name from configured RSS URL
      if (settings.newsRssUrl) {
        newsSource = extractSourceName(settings.newsRssUrl);
      }

      updateWeather(state.weather);
      updateAirQuality(state.airQuality);
      updateHebrewDate(state.hebrewDate);
      updateAlerts(state.alerts);
      updateBottomBar(state, settings);
    } catch (err) {
      console.error('Dashboard poll error:', err);
    }
  }

  // Initial poll + show first headline
  poll().then(() => showCurrentHeadline());

  // Poll state every 10s (updates data silently)
  setInterval(poll, POLL_INTERVAL);

  // Cycle to next headline once per minute
  setInterval(showCurrentHeadline, HEADLINE_CYCLE_INTERVAL);
})();
