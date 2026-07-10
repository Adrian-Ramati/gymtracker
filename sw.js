const CACHE = 'gymtracker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
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
