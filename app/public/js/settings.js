(function () {
  const form = document.getElementById('settings-form');
  const status = document.getElementById('save-status');

  // Track the masked values returned by the server so we can detect changes
  let loadedSecrets = {};

  async function loadSettings() {
    const res = await fetch('/api/settings');
    const s = await res.json();

    form.bottomBarMode.value = s.bottomBarMode;
    form.use24hr.value = String(s.use24hr);
    form.alertsEnabled.checked = s.alertsEnabled;
    form.alertsInterval.value = s.alertsInterval;
    form.newsRssUrl.value = s.newsRssUrl;
    form.latitude.value = s.latitude;
    form.longitude.value = s.longitude;
    form.geonameId.value = s.geonameId;
    form.timezone.value = s.timezone || '';

    // Show masked API key values as placeholder text, leave input empty
    form.openweatherApiKey.value = '';
    form.iqairApiKey.value = '';
    form.openweatherApiKey.placeholder = s.openweatherApiKey || 'Enter API key';
    form.iqairApiKey.placeholder = s.iqairApiKey || 'Enter API key';

    loadedSecrets = {
      openweatherApiKey: s.openweatherApiKey || '',
      iqairApiKey: s.iqairApiKey || '',
    };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      bottomBarMode: form.bottomBarMode.value,
      use24hr: form.use24hr.value === 'true',
      alertsEnabled: form.alertsEnabled.checked,
      alertsInterval: parseInt(form.alertsInterval.value, 10),
      newsRssUrl: form.newsRssUrl.value,
      latitude: parseFloat(form.latitude.value),
      longitude: parseFloat(form.longitude.value),
      geonameId: parseInt(form.geonameId.value, 10),
      timezone: form.timezone.value,
    };

    // Only send API keys if user typed a new value
    if (form.openweatherApiKey.value) {
      body.openweatherApiKey = form.openweatherApiKey.value;
    }
    if (form.iqairApiKey.value) {
      body.iqairApiKey = form.iqairApiKey.value;
    }

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const saved = await res.json();

    // Update placeholders with new masked values
    form.openweatherApiKey.value = '';
    form.iqairApiKey.value = '';
    form.openweatherApiKey.placeholder = saved.openweatherApiKey || 'Enter API key';
    form.iqairApiKey.placeholder = saved.iqairApiKey || 'Enter API key';

    status.classList.remove('hidden');
    setTimeout(() => status.classList.add('hidden'), 2500);
  });

  loadSettings();
})();
