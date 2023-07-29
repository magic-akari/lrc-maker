import { createElement } from "npm:react";
import { render } from "npm:react-dom";
import { App } from "./components/app.js";

if (!("scrollBehavior" in document.documentElement.style)) {
    import("./polyfill/smooth-scroll.js");
}

// Do not use createRoot
// before https://github.com/facebook/react/issues/26374 fixed
render(createElement(App), document.querySelector(".app-container"), () => {
    if (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
        document.addEventListener("click", (ev) => {
            const href = (ev.target as HTMLAnchorElement).getAttribute("href");

            if (href?.startsWith("#")) {
                ev.preventDefault();
                location.replace(href);
            }
        });
    }

    window.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        ev.dataTransfer!.dropEffect = "copy";
    });
    window.addEventListener("drop", (ev) => {
        ev.preventDefault();
    });
});
