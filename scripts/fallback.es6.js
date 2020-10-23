window.addEventListener("error", (ev) => {
    const { message: m, error: e } = ev;
    if ((/SyntaxError/.test(m) && /import/.test(m)) || (/Syntax error/.test(e.message) && /import/.test(e.source))) {
        ev.preventDefault();
        console.log("dynamic module import is not implemented. fallback...");
        const es6 = document.querySelector(".index-es6");
        const sc = document.createElement("script");
        sc.src = es6.src;
        sc.integrity = es6.integrity;
        sc.crossOrigin = es6.crossOrigin;
        document.head.appendChild(sc);
    }
});
