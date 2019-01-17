if ("serviceWorker" in navigator) {
    window.addEventListener("error", (ev) => {
        if (
            // Firefox
            (ev.message.includes("SyntaxError") &&
                ev.filename.includes("useLang.js")) ||
            // Edge
            ev.message === "Syntax error"
        ) {
            ev.preventDefault();
            location.reload();
        }
    });

    const sw = navigator.serviceWorker;

    sw.register("./sw.js").then(
        (registration) => {
            // Registration was successful
            registration.update();
            window.serviceWorkerRegistration = registration;
            console.log(
                "ServiceWorker Registed (｡･ω･｡)ﾉ: ",
                registration.scope
            );
        },
        (err) => {
            // registration failed :(
            console.log("ServiceWorker registration failed ಥ_ಥ: ", err);
        }
    );
}
