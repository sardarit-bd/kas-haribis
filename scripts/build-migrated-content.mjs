import fs from 'node:fs';

const decode = (value = '') =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&#8221;|&quot;/g, '"')
    .replace(/&#(d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
const categories = Object.fromEntries(
  JSON.parse(fs.readFileSync('/tmp/kav_categories.json', 'utf8')).map((x) => [
    x.id,
    x.slug,
  ]),
);
const posts = [1, 2, 3, 4].flatMap((page) =>
  JSON.parse(fs.readFileSync(`/tmp/kav_posts_${page}.json`, 'utf8')),
);
const bankCategories = new Set([
  'kosher',
  'no-good',
  'questionable',
  'only-kosher-with-iska',
  'lack-of-information',
  'mehudar',
]);
const banks = posts
  .filter((post) =>
    (post.categories || []).some((id) => bankCategories.has(categories[id])),
  )
  .map((post) => ({
    id: post.id,
    slug: post.slug,
    title: decode(post.title.rendered),
    status:
      (post.categories || [])
        .map((id) => categories[id])
        .find((cat) => bankCategories.has(cat)) || 'uncategorized',
    summary: decode(post.excerpt.rendered || post.content.rendered).slice(
      0,
      650,
    ),
    source: post.link,
  }));
const articles = posts
  .filter((post) =>
    (post.categories || []).some((id) => categories[id] === 'article'),
  )
  .map((post) => ({
    id: post.id,
    slug: post.slug,
    title: decode(post.title.rendered),
    date: post.date?.slice(0, 10),
    summary: decode(post.excerpt.rendered || post.content.rendered).slice(
      0,
      500,
    ),
    source: post.link,
  }));
const audioTypes = JSON.parse(
  fs.readFileSync('/tmp/kav_audio_full.json', 'utf8'),
);
const pages = JSON.parse(fs.readFileSync('/tmp/kav_pages.json', 'utf8'));
const audioHtml =
  pages.find((page) => page.slug === 'audios')?.content?.rendered || '';
const audioUrls = [...audioHtml.matchAll(/<source[^>]+src="([^"]+)"/gi)].map(
  (match) => match[1].trim(),
);
const audios = audioTypes
  .map((item, index) => ({
    id: item.id,
    title: decode(item.title.rendered),
    series:
      (item.categories || [])
        .map((id) => categories[id])
        .find((value) => value?.includes('series')) || 'english-series',
    audioUrl: audioUrls[index] || '',
    source: item.link,
  }))
  .filter((item) => item.audioUrl);
const loadType = (name) =>
  JSON.parse(fs.readFileSync(`/tmp/kav_${name}.json`, 'utf8')).map((item) => ({
    id: item.id,
    slug: item.slug,
    title: decode(item.title?.rendered) || decode(item.slug),
    summary: decode(item.excerpt?.rendered || item.content?.rendered).slice(
      0,
      500,
    ),
    source: item.link,
  }));
const data = {
  generatedAt: new Date().toISOString(),
  banks,
  articles,
  audios,
  businesses: loadType('businesses'),
  savingAccounts: loadType('saving-accounts'),
  sourcePages: pages.map((page) => ({
    slug: page.slug,
    title: decode(page.title.rendered),
    summary: decode(page.content.rendered).slice(0, 900),
  })),
};
fs.mkdirSync('app/data', { recursive: true });
fs.writeFileSync(
  'app/data/current-site.json',
  JSON.stringify(data, null, 2) + '\n',
);
console.log({
  banks: banks.length,
  articles: articles.length,
  audios: audios.length,
  businesses: data.businesses.length,
  savingAccounts: data.savingAccounts.length,
});
