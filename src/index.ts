import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app.js";

if (!("scrollBehavior" in document.documentElement.style)) {
    import("./polyfill/smooth-scroll.js");
}

const container = document.querySelector(".app-container");
const root = createRoot(container!);

root.render(createElement(App));

if ((navigator as any).standalone || window.matchMedia("(display-mode: standalone)").matches) {
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
