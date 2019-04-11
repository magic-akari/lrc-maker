window.addEventListener("error", (ev) => {
    if (
        (ev.message.includes("SyntaxError") && ev.message.includes("import")) ||
        (ev.message === "Syntax error" && ev.error.source && ev.error.source.includes("import"))
    ) {
        ev.preventDefault();
        console.log("dynamic module import is not implemented. fallback...");
        const es6 = document.querySelector(".index-es6");
        const script = document.createElement("script");
        script.src = es6.src;
        script.integrity = es6.integrity;
        script.crossOrigin = es6.crossOrigin;
        document.head.appendChild(script);
    }
});
