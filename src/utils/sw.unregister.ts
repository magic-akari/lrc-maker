export const unregister = async () => {
    const APP_NAME = "akari-lrc-maker";

    if ("serviceWorker" in navigator) {
        await caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return cacheName.startsWith(APP_NAME);
                    })
                    .map((cacheName) => {
                        return caches.delete(cacheName);
                    }),
            );
        });

        await navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                registration.unregister().then(() => {
                    location.reload(true);
                });
            }
        });
    }
};
