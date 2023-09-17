export async function unregister() {
    const APP_NAME = "akari-lrc-maker";

    if ("serviceWorker" in navigator) {
        await caches.keys().then(async (cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return cacheName.startsWith(APP_NAME);
                    })
                    .map(async (cacheName) => {
                        return caches.delete(cacheName);
                    }),
            );
        });

        await navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                void registration.unregister().then(() => {
                    location.reload();
                });
            }
        });
    }
}
