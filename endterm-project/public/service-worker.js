const APP_SHELL_CACHE = "app-shell-v1";
const RUNTIME_CACHE = "runtime-cache-v1";

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");

  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll([
        "/",             
        "/index.html",
        "/icons/pwa-192x192.png",
        "/icons/pwa-512x512.png",
        "/assets/index-DQQlAH2U.css",
        "/assets/index-CkMiCpVr.js"
      ]);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Network-first для навигации
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Cache-first для других ресурсов
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(req, response.clone());
            return response;
          });
        })
        .catch(() => {
          return new Response("Offline", { status: 503 });
        });
    })
  );
});
