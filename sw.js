// Service Worker der Wetter-App: hält die App-Dateien offline vor.
// HTML wird network-first geladen (Updates kommen sofort an), statische
// Assets cache-first. API-Aufrufe (fremde Origins) werden nicht angefasst.
// Wichtig: GitHub Pages liefert index.html mit "Cache-Control: max-age=600" —
// ohne {cache:'no-store'} würde fetch() hier den 10-Minuten-Browser-Cache
// treffen und ein Update erst nach Ablauf dieser Frist zeigen.
const CACHE = 'wetter-app-v3';
const ASSETS = [
  './',
  './index.html',
  './chart.umd.js',
  './fonts/outfit.woff2',
  './apple-touch-icon.png',
  './leaflet/leaflet.js',
  './leaflet/leaflet.css',
  './leaflet/images/layers.png',
  './leaflet/images/layers-2x.png',
  './leaflet/images/marker-icon.png',
  './leaflet/images/marker-icon-2x.png',
  './leaflet/images/marker-shadow.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() =>
        caches.match(e.request).then(r => r || caches.match('./index.html'))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
