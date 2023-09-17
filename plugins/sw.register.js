if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then(
        (registration) => {
            // Registration was successful
            registration.update();
            console.log("ServiceWorker Registed (｡･ω･｡)ﾉ: ", registration.scope);
        },
        (err) => {
            // registration failed :(
            console.log("ServiceWorker registration failed ( ꒪﹃ ꒪) ", err);
        },
    );
}
