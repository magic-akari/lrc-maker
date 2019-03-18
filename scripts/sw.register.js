if ("serviceWorker" in navigator) {
    window.addEventListener("error", (ev) => {
        if (ev.message.includes("SyntaxError") && ev.filename.includes("useLang.js")) {
            ev.preventDefault();
            location.reload();
        }
    });

    const sw = navigator.serviceWorker;

    sw.register("./sw.js").then(
        (registration) => {
            // Registration was successful
            registration.update();
            console.log("ServiceWorker Registed (｡･ω･｡)ﾉ: ", registration.scope);
        },
        (err) => {
            // registration failed :(
            console.log("ServiceWorker registration failed ಥ_ಥ: ", err);
        }
    );
}
