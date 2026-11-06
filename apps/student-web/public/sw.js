/* AIM service worker: makes the app open offline and keeps lesson audio you have played.
 *
 * What is cached, and what is deliberately NOT:
 *  - App shell + built assets (/static/*, fonts, icons): cached, refreshed in the background.
 *  - Navigations (page loads): network first; offline falls back to the cached app shell.
 *  - Lesson / question / TTS audio (GET only, same origin): cached after first play, capped.
 *  - Every other /api request (anything with a login token, personal data, writes): never cached.
 */
const VERSION = 'v1';
const SHELL = `aim-shell-${VERSION}`;
const ASSETS = `aim-assets-${VERSION}`;
const AUDIO = `aim-audio-${VERSION}`;
const MAX_AUDIO_ENTRIES = 60;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/manifest.json', '/icon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('aim-') && ![SHELL, ASSETS, AUDIO].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Only shared lesson/question audio — never per-student AI or voice-teacher message audio.
const isAudioRequest = (url) => /\/(questions|lesson-assets)\/[^/]+\/audio$/.test(url.pathname);

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page loads: network first, cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(SHELL).then((c) => c.put('/', copy)).catch(() => undefined);
        return res;
      }).catch(() => caches.match('/')),
    );
    return;
  }

  // Built assets are content-hashed: serve from cache, refresh quietly.
  if (url.pathname.startsWith('/static/') || url.pathname.startsWith('/fonts/') || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        const fresh = fetch(request).then((res) => { if (res.ok) cache.put(request, res.clone()); return res; }).catch(() => hit);
        return hit || fresh;
      }),
    );
    return;
  }

  // Audio the student has played: cache-first, bounded.
  if (url.pathname.startsWith('/api/') && isAudioRequest(url)) {
    event.respondWith(
      caches.open(AUDIO).then(async (cache) => {
        const hit = await cache.match(request, { ignoreVary: true });
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok && res.status === 200) { cache.put(request, res.clone()).then(() => trim(AUDIO, MAX_AUDIO_ENTRIES)); }
        return res;
      }),
    );
  }
  // Anything else (all other API calls): untouched, always the network.
});
