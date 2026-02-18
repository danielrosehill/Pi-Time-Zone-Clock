// Dashboard: polls /api/state every 10s, updates DOM, handles mode switching
(function () {
  const POLL_INTERVAL = 10000;
  let currentHeadlineIdx = 0;
  let headlines = [];

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
    // Show month + day (e.g., "ADAR 2")
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

  function updateNews(news) {
    if (!news || news.length === 0) return;
    headlines = news;
    // Cycle headline
    currentHeadlineIdx = currentHeadlineIdx % headlines.length;
    $newsHeadline.textContent = headlines[currentHeadlineIdx].title;
    currentHeadlineIdx = (currentHeadlineIdx + 1) % headlines.length;
  }

  function updateBottomBar(state, settings) {
    const mode = (settings && settings.bottomBarMode) || 'auto';
    let showShabbat = false;

    if (mode === 'shabbat') {
      showShabbat = true;
    } else if (mode === 'news') {
      showShabbat = false;
    } else {
      // auto: follow server isShabbat flag
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

      updateWeather(state.weather);
      updateAirQuality(state.airQuality);
      updateHebrewDate(state.hebrewDate);
      updateAlerts(state.alerts);
      updateBottomBar(state, settings);
    } catch (err) {
      console.error('Dashboard poll error:', err);
    }
  }

  poll();
  setInterval(poll, POLL_INTERVAL);
})();
