const cacheName = "akari-lrc-maker-2017.04.24";
const urlsToCache = [
  "",
  "dist/app.css",
  "dist/React.js",
  "dist/ReactDOM.js",
  "dist/app.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      ))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(response => caches.open(cacheName).then(cache => {
          cache.put(e.request.url, response.clone());
          return response;
        }))
      .catch(() => caches.match(e.request.url))
  );
});
