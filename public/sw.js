// Service Worker for BeerCan Tracker PWA
const CACHE_NAME = 'beercan-tracker-v1';
const OFFLINE_URL = '/offline';

// キャッシュするリソース
const urlsToCache = [
  '/',
  '/stats',
  '/records',
  '/login',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/images/drink_beer_can_short.png',
  '/images/drink_beer_can_long.png'
];

// Service Worker インストール時
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] All resources cached');
        return self.skipWaiting();
      })
  );
});

// Service Worker アクティベート時
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Cache cleanup completed');
      return self.clients.claim();
    })
  );
});

// ネットワークリクエスト処理
self.addEventListener('fetch', (event) => {
  // Supabase APIリクエストはキャッシュしない
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // GET リクエストのみ処理
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          console.log('[SW] Cache hit:', event.request.url);
          return response;
        }

        // ネットワークから取得を試行
        console.log('[SW] Cache miss, fetching:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // レスポンスが有効でない場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            console.log('[SW] Network failed, serving offline page');
            // ナビゲーションリクエストの場合はオフラインページを表示
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// プッシュ通知処理（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  const options = {
    body: '飲酒記録を忘れていませんか？',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'アプリを開く',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '閉じる'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BeerCan Tracker', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // データ同期処理
      console.log('[SW] Background sync completed')
    );
  }
});

// メッセージ処理
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});