/**
 * Created by 阿卡琳 on 01/07/2017.
 */
"use strict";
const APP_NAME = "akari-lrc-maker";

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  if (!/(?:\.js|\.css|\/)$/.test(event.request.url)) {
    return;
  }
  event.respondWith(
    caches.open(APP_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        });
    })
  );
});
