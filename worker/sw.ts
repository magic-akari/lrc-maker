declare const self: ServiceWorkerGlobalScope;
export {};

const APP_NAME = "akari-lrc-maker";
const VERSION = "5.0.0";

const supportDynamicImport = (() => {
    try {
        // tslint:disable-next-line:no-unused-expression
        new Function(`import('')`);
        return true;
    } catch (error) {
        return false;
    }
})();

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all<any>([
                self.clients.claim(),
                ...cacheNames
                    .filter((cacheName) => {
                        return (
                            cacheName.startsWith(APP_NAME) &&
                            cacheName !== `${APP_NAME}-${VERSION}`
                        );
                    })
                    .map((cacheName) => {
                        return caches.delete(cacheName);
                    }),
            ]);
        }),
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    if (
        !/(?:\.css|\.js|\/)$/.test(url.pathname) ||
        url.protocol === "chrome-extension:"
    ) {
        return;
    }

    console.log("sw.fetch", url);

    event.respondWith(
        caches.open(`${APP_NAME}-${VERSION}`).then((cache) =>
            fetch(event.request)
                .then((response) => {
                    if (
                        supportDynamicImport ||
                        !/useLang\.js$/.test(event.request.url)
                    ) {
                        cache.put(event.request, response.clone());
                        return response;
                    }

                    return response.text().then((text) => {
                        const newText = text.replace("import(", "Import(");

                        const newResponse = new Response(newText, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers,
                        });
                        cache.put(event.request, newResponse.clone());

                        return newResponse;
                    });
                })
                .catch(() => {
                    return cache.match(event.request) as Promise<Response>;
                }),
        ),
    );
});
