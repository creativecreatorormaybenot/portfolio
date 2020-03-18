'use strict';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "/favicon.png": "5dcef449791fa27946b3d35ad8803796",
"/icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"/icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"/main.dart.js": "9ee3ca705827e655163c36cb0dd8e3f6",
"/manifest.json": "0cd4c9d954c3e172e7515a3c1053e4e0",
"/index.html": "6b848d47eeb04d776f3c88144699f750",
"/assets/FontManifest.json": "d751713988987e9331980363e24189ce",
"/assets/LICENSE": "b496bbb7c424a7f39a5c2bc7de2bedb0",
"/assets/assets/stackoverflow.png": "6b99b3bbe6bc99a25625f112a43953bd",
"/assets/assets/github.png": "ef7a02b69836dc8b6a732a54c4200dcb",
"/assets/assets/youtube.png": "eb3072f91cb01f5b1f7c6ac76c404c61",
"/assets/assets/medium.png": "45140ce1eb5fe8d0caed749229873cca",
"/assets/assets/play_store.png": "fb481c44958bd1d21e52d0a856286fc4",
"/assets/assets/avatar.png": "f106a5cbc8c59640a851646b83e632d2",
"/assets/assets/web.png": "a98add2dfc3ba7af22c34cec4ad73767",
"/assets/assets/twitter.png": "fba3a2dc663db92a2a02cb4fb1870ad3",
"/assets/assets/dart_pub.png": "0f2d957830ec863d7d22eb4fc19e76be",
"/assets/assets/reddit.png": "f062fad2fbb0e11e82eb988d2b0647d1",
"/assets/AssetManifest.json": "7c03e6fed6e4c3fa8ad3edc957ececa9"
};

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheName) {
      return caches.delete(cacheName);
    }).then(function (_) {
      return caches.open(CACHE_NAME);
    }).then(function (cache) {
      return cache.addAll(Object.keys(RESOURCES));
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
