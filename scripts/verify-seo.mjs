import assert from 'node:assert/strict';

const origin = process.argv[2] || 'http://127.0.0.1:3107';
const canonicalOrigin = 'https://agnails.ru';
const slugs = ['', 'manikyur-samara', 'pedikyur-samara', 'narashchivanie-nogtey-samara', 'dizayn-nogtey-samara', 'tseny', 'kontakty'];
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200, 'sitemap status');
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
assert.deepEqual(urls.sort(), slugs.map(slug => `${canonicalOrigin}/${slug}`).sort(), 'only canonical pages in sitemap');
const titles = new Set();
for (const slug of slugs) {
  const response = await fetch(`${origin}/${slug}`);
  assert.equal(response.status, 200, `${slug}: status`);
  const html = await response.text();
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  assert.equal(canonical?.replace(/\/$/, ''), `${canonicalOrigin}/${slug}`.replace(/\/$/, ''), `${slug}: canonical`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${slug}: one H1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${slug}: unique title`);
  titles.add(title);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
  assert.ok(schemas.some(s => s['@type'] === 'NailSalon'), `${slug}: business schema`);
  if (slug) {
    assert.ok(schemas.some(s => s['@type'] === 'BreadcrumbList'), `${slug}: breadcrumbs`);
    assert.ok(html.includes('seo-work-card'), `${slug}: gallery is not empty`);
    const gallery = html.match(/<div class="seo-gallery shell">(.*?)<\/div>/s)?.[1] || '';
    const images = [...gallery.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]);
    assert.ok(images.length, `${slug}: gallery images`);
    for (const url of images) assert.equal((await fetch(new URL(url, origin))).status, 200, url);
  }
  for (const target of slugs.filter(Boolean)) assert.ok(html.includes(`href="/${target}"`), `${slug}: link to ${target}`);
  assert.ok(!html.includes('service-navigation-grid'), `${slug}: no appended card block`);
  assert.ok(!html.includes('Онлайн-запись через DIKIDI. Онлайн-запись'), `${slug}: no duplicate description`);
  assert.ok(!html.includes('ЖК «Центральный»'), `${slug}: current landmark`);
  const styles = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(styles.length, `${slug}: styles present`);
  for (const url of styles) assert.equal((await fetch(new URL(url, origin))).status, 200, url);
  console.log(`PASS /${slug}`);
}
for (const [path, fragment] of [['prices','prices'],['price','prices'],['prajs','prices'],['works','works'],['reviews','reviews'],['location','location']]) {
  const response = await fetch(`${origin}/${path}?utm_source=seo-check`, {redirect:'manual'});
  assert.ok([301,308].includes(response.status), `${path}: permanent redirect`);
  const target = new URL(response.headers.get('location'), origin);
  assert.equal(target.pathname, '/');
  assert.equal(target.hash, `#${fragment}`);
  assert.equal(target.searchParams.get('utm_source'), 'seo-check');
}
const robotsResponse = await fetch(`${origin}/robots.txt`);
assert.equal(robotsResponse.status, 200);
assert.ok((await robotsResponse.text()).includes(`${canonicalOrigin}/sitemap.xml`));
assert.equal((await fetch(`${origin}/missing-seo-check-page`)).status, 404, 'unknown URLs must not be soft 404s');
console.log('PASS sitemap, robots, CSS, redirects, UTM preservation and real 404');
