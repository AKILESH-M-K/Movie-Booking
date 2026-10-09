const CACHE_NAME = "cinebook-v7";
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
    Promise.all([self.clients.claim(), caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("cinebook-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),]),
  );
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
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(`${BASE_PATH}index.html`, copy)));
        }
        return response;
      }).catch(async () => (await caches.match(request)) || caches.match(`${BASE_PATH}index.html`)),
    );
    return;
  }

  // Never store API/JSON responses: they may contain account or booking data.
  if (request.headers.get("Accept")?.includes("application/json")) return;

  // Cache static app assets only; hashed Vite bundles are immutable.
  if (!["script", "style", "image", "font"].includes(request.destination)) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
        }
        return response;
      });
    }),
  );
});
