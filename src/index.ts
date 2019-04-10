import { App } from "./components/app.js";

// let EDGE throw error early
import(/* webpackMode: "eager" */ "./polyfill/smooth-scroll.js");

const akariOdango = document.querySelector(".akari-odango-loading")!;
const pageLoading = akariOdango.parentElement!;

akariOdango.addEventListener(
    "animationend",
    () => {
        pageLoading.remove();
    },
    { once: true },
);

akariOdango.classList.remove("start-loading");
akariOdango.classList.add("stop-loading");
ReactDOM.render(React.createElement(App), document.querySelector(".app-container"));
