// Client-side clock tick — updates every second
(function () {
  let TIMEZONE = 'Asia/Jerusalem'; // default, overridden by settings

  const $localTime = document.getElementById('local-time');
  const $localSeconds = document.getElementById('local-seconds');
  const $utcTime = document.getElementById('utc-time');
  const $utcSeconds = document.getElementById('utc-seconds');
  const $dayName = document.getElementById('day-name');
  const $gregDate = document.getElementById('greg-date');

  const pad = (n) => String(n).padStart(2, '0');

  const DAYS = ['SUN', 'MON', 'TUES', 'WEDS', 'THURS', 'FRI', 'SAT'];

  function tick() {
    const now = new Date();

    // Local time in configured timezone
    const localParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(now);

    const lp = {};
    localParts.forEach((p) => { lp[p.type] = p.value; });
    $localTime.textContent = `${lp.hour}:${lp.minute}`;
    $localSeconds.textContent = lp.second;

    // UTC
    $utcTime.textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
    $utcSeconds.textContent = pad(now.getUTCSeconds());

    // Date in configured timezone
    const dateParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      weekday: 'short', month: 'short', day: 'numeric',
    }).formatToParts(now);

    const dp = {};
    dateParts.forEach((p) => { dp[p.type] = p.value; });

    // Map short weekday to our preferred format
    const dayIdx = new Date(
      new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
    ).getDay();

    $dayName.textContent = DAYS[dayIdx];
    $gregDate.textContent = `${dp.month.toUpperCase()} ${dp.day}`;
  }

  // Fetch timezone from settings, then start ticking
  fetch('/api/settings')
    .then((res) => res.json())
    .then((settings) => {
      if (settings.timezone) {
        TIMEZONE = settings.timezone;
      }
    })
    .catch(() => {}) // use default on error
    .finally(() => {
      tick();
      setInterval(tick, 1000);
    });
})();
