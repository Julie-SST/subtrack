const VERSION = "subtrack-v1";
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(req);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(req, networkResponse.clone());
          return networkResponse;
        } catch {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match(req);
          return cached || (await cache.match(OFFLINE_URL));
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const networkResponse = await fetch(req);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(req, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
