import { App } from "./components/app.js";

if ("scrollBehavior" in document.documentElement.style) {
    // smooth scroll natively supported
} else {
    import(/* webpackMode: "eager" */ "./polyfill/smooth-scroll.js");
}

ReactDOM.render(React.createElement(App), document.querySelector(".app-container"), () => {
    document.querySelector(".page-loading")!.remove();
    window.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        ev.dataTransfer!.dropEffect = "copy";
    });
    window.addEventListener("drop", (ev) => {
        ev.preventDefault();
    });
});
