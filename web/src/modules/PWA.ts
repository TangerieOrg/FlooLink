const sw = "service-worker.js"; // it is needed because parcel will not recognize this as a file and not precess in its manner
export const LoadPWA = () => {
    console.log("Loading PWA Service Worker")
    navigator.serviceWorker
        .register(sw)
        .then(registration => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === "installed") {
                        if (navigator.serviceWorker.controller) {
                            console.log(
                                "New content is available, page will be reloaded"
                            );
                            window.location.reload();
                        } else {
                            console.log("Content is cached for offline use.");
                        }
                    }
                };
            };
        })
        .catch(error => {
            console.error("Error during service worker registration:", error);
        });
}