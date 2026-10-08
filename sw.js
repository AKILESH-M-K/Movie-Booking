const CACHE_NAME = "cinebook-v5";
const BASE_PATH = "/Movie-Booking/";
const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}site.webmanifest`,
  `${BASE_PATH}android-chrome-192x192.png`,
  `${BASE_PATH}android-chrome-512x512.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("cinebook-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only cache same-origin app assets. Third-party requests and API responses
  // are never cached, so user-specific data cannot be served from the cache.
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE_PATH)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(`${BASE_PATH}index.html`, copy));
          }
          return response;
        })
        .catch(() => caches.match(`${BASE_PATH}index.html`)),
    );
    return;
  }

  // Assets with hashed filenames are immutable; cache them after first fetch.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
