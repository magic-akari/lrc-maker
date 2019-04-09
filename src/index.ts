import { App } from "./components/app.js";
import "./polyfill.js";

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
