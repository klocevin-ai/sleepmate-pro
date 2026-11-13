/* =====================================================================
   SLEEPMATE Pro â€” Service Worker
   - Cache app shell Ä‘á»ƒ má»Ÿ Ä‘Æ°á»£c khi máº¥t máº¡ng
   - Nháº­n notificationclick / push (náº¿u sau nÃ y gáº¯n Web Push)
   Khi cáº­p nháº­t app: tÄƒng CORE_CACHE vÃ  RUNTIME_CACHE bÃªn dÆ°á»›i.
   ===================================================================== */

const CORE_CACHE = 'sleepmate-core-v9';
const RUNTIME_CACHE = 'sleepmate-runtime-v9';

const APP_SHELL = [
  './',
  './index.html',
  './firebase-config.js',
  './tracker.js',
  './admin.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

/* ---------- CÃ i Ä‘áº·t: náº¡p sáºµn app shell ----------
   Náº¡p láº§n lÆ°á»£t tá»«ng file (thay vÃ¬ song song) Ä‘á»ƒ khÃ´ng lÃ m ngháº½n server yáº¿u,
   vÃ  thá»­ láº¡i 1 láº§n náº¿u máº¡ng cháº­p chá»n. Nhá» váº­y cache luÃ´n Ä‘á»§ 7 file. */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    for (const url of APP_SHELL) {
      try {
        await cache.add(url);
      } catch (e) {
        try { await cache.add(url); } catch (e2) { /* bá» qua file lá»—i, láº§n fetch sau sáº½ bÃ¹ */ }
      }
    }
    await self.skipWaiting();
  })());
});

/* ---------- KÃ­ch hoáº¡t: dá»n cache cÅ© ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== CORE_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- Cho phÃ©p trang yÃªu cáº§u cáº­p nháº­t ngay ---------- */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

/* ---------- Äiá»u hÆ°á»›ng: Æ°u tiÃªn máº¡ng, fallback cache ---------- */
function handleNavigation(request) {
  return fetch(request)
    .then((response) => {
      const copy = response.clone();
      caches.open(CORE_CACHE).then((cache) => cache.put('./index.html', copy)).catch(() => {});
      return response;
    })
    .catch(() =>
      caches.match(request)
        .then((hit) => hit || caches.match('./index.html') || caches.match('./'))
    );
}

/* ---------- TÃ i nguyÃªn cÃ¹ng tÃªn miá»n: cache-first ---------- */
function handleSameOrigin(request) {
  return caches.match(request).then((hit) => {
    if (hit) return hit;
    return fetch(request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CORE_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
      }
      return response;
    });
  });
}

/* ---------- TÃ i nguyÃªn ngoÃ i (Tailwind, Font Awesome, fonts): stale-while-revalidate ---------- */
function handleCrossOrigin(request) {
  return caches.match(request).then((hit) => {
    const network = fetch(request)
      .then((response) => {
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => hit);

    return hit || network;
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(handleSameOrigin(request));
    return;
  }

  if (/^https?:$/.test(url.protocol)) {
    event.respondWith(handleCrossOrigin(request));
  }
});

/* ---------- Báº¥m vÃ o thÃ´ng bÃ¡o: má»Ÿ/focus app ---------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(target).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});

/* ---------- Web Push (dá»± phÃ²ng cho tÆ°Æ¡ng lai) ---------- */
self.addEventListener('push', (event) => {
  let data = { title: 'SLEEPMATE', body: 'Äáº¿n giá» Ä‘i ngá»§ rá»“i!' };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch (e) {
    try { data.body = event.data.text(); } catch (err) { /* bá» qua */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'SLEEPMATE', {
      body: data.body || 'Äáº¿n giá» Ä‘i ngá»§ rá»“i!',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'sleepmate-push',
      renotify: true,
      requireInteraction: true,
      vibrate: [250, 120, 350, 120, 400],
      data: { url: (data.url || './') }
    })
  );
});

