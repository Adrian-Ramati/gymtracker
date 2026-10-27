// sw.js — Service worker de Peak Physique.
// · App (mismo origen): primero red y, si no hay conexión, la copia guardada. Así cada versión nueva
//   llega en cuanto la subes y la app sigue abriendo sin conexión.
// · Animaciones de ejercicios (GitHub): primero caché; se guardan al verlas o al precargarlas.
// · Librerías (Chart.js, Supabase, fuentes): caché y se refrescan en segundo plano.
// · Supabase y el resto de APIs: siempre por red (no se guardan).
const VERSION = 'pp-2026-10-27b';
const APP_CACHE = 'app-' + VERSION;
const GIF_CACHE = 'pp-gifs-v1';   // mismo nombre en js/gifs.js (precarga)
const CDN_CACHE = 'pp-cdn-v1';
const MAX_GIFS = 600;
const ASSETS = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './exgifs.json', './css/app.css',
  './js/core.js', './js/state.js', './js/data.js', './js/train.js', './js/library.js', './js/body.js',
  './js/activity.js', './js/timers.js', './js/calendar.js', './js/figure.js', './js/gifs.js', './js/nav.js',
  './js/exview.js', './js/hyper.js', './js/meso.js', './js/registro.js', './js/health.js', './js/main.js',
];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const isGif = u => u.hostname === 'raw.githubusercontent.com' && u.pathname.startsWith('/hasaneyldrm/exercises-dataset/');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP_CACHE).then(c => c.addAll(ASSETS.map(a => new Request(a, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  const keep = [APP_CACHE, GIF_CACHE, CDN_CACHE];
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k)))));
  self.clients.claim();
});

async function networkFirst(req) {
  const cache = await caches.open(APP_CACHE);
  try {
    const res = await fetch(req, { cache: 'no-cache' });
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') { const shell = await cache.match('./index.html'); if (shell) return shell; }
    throw err;
  }
}
async function trimCache(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}
async function gifFirst(req) {
  const cache = await caches.open(GIF_CACHE);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const res = await fetch(req.url, { mode: 'cors' });   // CORS (no opaca): ocupa lo que pesa de verdad
    if (res.ok) { await cache.put(req.url, res.clone()); trimCache(GIF_CACHE, MAX_GIFS); }
    return res;
  } catch (err) { return fetch(req); }
}
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CDN_CACHE);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) { e.respondWith(networkFirst(req)); return; }
  if (isGif(url)) { e.respondWith(gifFirst(req)); return; }
  if (CDN_HOSTS.includes(url.hostname)) { e.respondWith(staleWhileRevalidate(req)); return; }
  // Supabase, Anthropic, etc.: sin interceptar
});

// ═══════════════════════════════════════════════════════════════════════════
// REST TIMER NOTIFICATIONS — append this block to the END of your existing sw.js
// (do not remove your current cache/offline logic; this is purely additive)
// ═══════════════════════════════════════════════════════════════════════════
let restTimerId = null;

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'schedule-rest') {
    if (restTimerId) clearTimeout(restTimerId);
    // +1200ms past the end time: if the app is visible, the in-page timer fires
    // first and sends 'cancel-rest', so the user never gets a duplicate alert.
    const delay = Math.max(0, d.endTs - Date.now()) + 1200;
    restTimerId = setTimeout(() => {
      restTimerId = null;
      self.registration.showNotification('¡Descanso terminado! 💪', {
        body: 'Siguiente serie',
        tag: 'rest-timer',      // replaces any previous rest notification
        renotify: true,
        vibrate: [200, 80, 200],
        // icon: 'icons/icon-192.png',  // uncomment + adjust if you have an icon
        silent: false,
      });
    }, delay);
  } else if (d.type === 'cancel-rest') {
    if (restTimerId) { clearTimeout(restTimerId); restTimerId = null; }
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
      const c = cs.find((c) => 'focus' in c);
      if (c) return c.focus();
      return self.clients.openWindow('./');
    })
  );
});
