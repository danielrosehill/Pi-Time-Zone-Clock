const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const config = require('../config/config');

async function poll(state) {
  try {
    const rssUrl = config.get('newsRssUrl') || 'https://www.timesofisrael.com/feed/';
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
    setInterval(() => poll(state), config.DEFAULTS.newsInterval);
  },
};
