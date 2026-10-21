/* Сервис-воркер: офлайн-режим */
const CACHE = 'planlife-v3';
const ASSETS = [
  './', 'index.html', 'index.en.html',
  'Конструктор_плана_жизни.html',
  'habitgrid.html', 'habitgrid.en.html',
  'База_знаний.html', 'База_знаний.en.html',
  'Приложения.html', 'Приложения.en.html',
  'Бот.html', 'Бот.en.html',
  'О_проекте.html', 'О_проекте.en.html',
  'manifest.webmanifest',
  'icons/icon-64.png', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => hit || caches.match('index.html'));
      return hit || net;
    })
  );
});
