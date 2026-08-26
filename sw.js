const CACHE_NAME = "megatlon-v25";

const EXERCISE_IMAGES = [
  ...Array.from({ length: 9 }, (_, i) => `./images/exercises/d1-${String(i + 1).padStart(2, "0")}.png`),
  ...Array.from({ length: 9 }, (_, i) => `./images/exercises/d2-${String(i + 1).padStart(2, "0")}.png`),
  ...Array.from({ length: 8 }, (_, i) => `./images/exercises/d3-${String(i + 1).padStart(2, "0")}.png`),
  ...Array.from({ length: 9 }, (_, i) => `./images/exercises/d4-${String(i + 1).padStart(2, "0")}.png`),
];

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data/routine.json",
  "./manifest.webmanifest",
  "./fonts/plus-jakarta-sans-latin.woff2",
  "./fonts/plus-jakarta-sans-latin-ext.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  ...EXERCISE_IMAGES,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
