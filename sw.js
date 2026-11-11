/* =====================================================================
   SLEEPMATE Pro — Service Worker
   - Cache app shell để mở được khi mất mạng
   - Nhận notificationclick / push (nếu sau này gắn Web Push)
   Khi cập nhật app: tăng CORE_CACHE và RUNTIME_CACHE bên dưới.
   ===================================================================== */

const CORE_CACHE = 'sleepmate-core-v6';
const RUNTIME_CACHE = 'sleepmate-runtime-v6';

const APP_SHELL = [
  './',
  './index.html',
  './firebase-config.js',
  './admin.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

/* ---------- Cài đặt: nạp sẵn app shell ----------
   Nạp lần lượt từng file (thay vì song song) để không làm nghẽn server yếu,
   và thử lại 1 lần nếu mạng chập chờn. Nhờ vậy cache luôn đủ 7 file. */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    for (const url of APP_SHELL) {
      try {
        await cache.add(url);
      } catch (e) {
        try { await cache.add(url); } catch (e2) { /* bỏ qua file lỗi, lần fetch sau sẽ bù */ }
      }
    }
    await self.skipWaiting();
  })());
});

/* ---------- Kích hoạt: dọn cache cũ ---------- */
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

/* ---------- Cho phép trang yêu cầu cập nhật ngay ---------- */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

/* ---------- Điều hướng: ưu tiên mạng, fallback cache ---------- */
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

/* ---------- Tài nguyên cùng tên miền: cache-first ---------- */
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

/* ---------- Tài nguyên ngoài (Tailwind, Font Awesome, fonts): stale-while-revalidate ---------- */
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

/* ---------- Bấm vào thông báo: mở/focus app ---------- */
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

/* ---------- Web Push (dự phòng cho tương lai) ---------- */
self.addEventListener('push', (event) => {
  let data = { title: 'SLEEPMATE', body: 'Đến giờ đi ngủ rồi!' };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch (e) {
    try { data.body = event.data.text(); } catch (err) { /* bỏ qua */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'SLEEPMATE', {
      body: data.body || 'Đến giờ đi ngủ rồi!',
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
