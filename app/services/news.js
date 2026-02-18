const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const defaults = require('../config/defaults');
const { getSettings } = require('../routes/settings');

const DEFAULT_RSS = 'https://www.timesofisrael.com/feed/';

async function poll(state) {
  try {
    const settings = getSettings();
    const rssUrl = settings.newsRssUrl || DEFAULT_RSS;
    const res = await fetch(rssUrl);
    if (!res.ok) throw new Error(`RSS feed ${res.status}`);
    const xml = await res.text();
    const parsed = await parseStringPromise(xml, { trim: true });

    const items = parsed.rss.channel[0].item || [];
    state.news = items.slice(0, 10).map((item) => ({
      title: item.title[0],
      link: item.link[0],
      pubDate: item.pubDate ? item.pubDate[0] : null,
    }));
  } catch (err) {
    console.error('News poll error:', err.message);
  }
}

module.exports = {
  start(state) {
    poll(state);
    setInterval(() => poll(state), defaults.newsInterval);
  },
};
