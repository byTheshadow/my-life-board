/*============================================================
   区块开始：Service Worker -缓存 & 通知
   ============================================================ */

const CACHE_NAME = 'petly-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js'
];

/*安装 - 缓存核心资源 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* 激活 - 清理旧缓存 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );self.clients.claim();
});

/* 请求拦截 - 缓存优先，网络回退 */
self.addEventListener('fetch', (event) => {
  //跳过 API 请求
  if (event.request.url.includes('/v1/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // 缓存新资源
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // 离线回退
      if (event.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});

/*推送通知 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Petly 提醒', {
      body: data.body || '',
      icon: data.icon || '🐾',
      tag: data.tag || 'petly-notification'
    })
  );
});

/* 通知点击 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});

/* ============================================================
   区块结束：Service Worker - 缓存 & 通知
   ============================================================ */
