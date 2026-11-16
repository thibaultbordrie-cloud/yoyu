// Offline support. Same-origin GET requests only: Yoyū never talks to another server.
const CACHE = "yoyu-v1";

async function precache() {
  const cache = await caches.open(CACHE);
  const shell = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png"];
  await cache.addAll(shell);
  // The built page names its hashed scripts and styles: cache them now, so the very first visit works offline.
  const html = await (await cache.match("./index.html")).text();
  const assets = [...html.matchAll(/(?:src|href)="\.?\/?(assets\/[^"]+)"/g)].map((m) => "./" + m[1]);
  await cache.addAll(assets);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Cache first, then refresh the copy in the background: fast, and up to date on the next visit.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => hit ?? cache.match("./index.html"));
      return hit ?? fresh;
    }),
  );
});
