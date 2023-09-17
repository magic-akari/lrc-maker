import { createElement } from "react";
// Do not use createRoot
// before https://github.com/facebook/react/issues/26374 fixed
// eslint-disable-next-line react/no-deprecated
import { render } from "react-dom";
import { App } from "./components/app.js";

if (!("scrollBehavior" in document.documentElement.style)) {
    import("./polyfill/smooth-scroll.js");
}

render(createElement(App), document.querySelector(".app-container"), () => {
    if (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
        document.addEventListener("click", (ev) => {
            const href = (ev.target as HTMLAnchorElement).getAttribute("href");

            if (href?.startsWith("#") === true) {
                ev.preventDefault();
                location.replace(href);
            }
        });
    }

    window.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        // @ts-expect-error FIXME
        ev.dataTransfer.dropEffect = "copy";
    });
    window.addEventListener("drop", (ev) => {
        ev.preventDefault();
    });
});
