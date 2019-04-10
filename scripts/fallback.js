window.addEventListener("error", (ev) => {
    if (
        (ev.message.includes("SyntaxError") && ev.message.includes("import")) ||
        (ev.message === "Syntax error" && ev.error.source && ev.error.source.includes("import"))
    ) {
        ev.preventDefault();
        console.log("dynamic module import is not implemented. fallback...");
        const nomodule = document.querySelector("script[nomodule]");
        const script = document.createElement("script");
        script.src = nomodule.src;
        script.integrity = nomodule.integrity;
        script.crossOrigin = nomodule.crossOrigin;
        document.head.appendChild(script);
    }
});
