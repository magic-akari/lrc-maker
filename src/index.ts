const akariOdango = document.querySelector(".akari-odango-loading")!;
const pageLoading = akariOdango.parentElement!;

akariOdango.addEventListener(
    "animationend",
    () => {
        pageLoading.remove();
    },
    { once: true },
);

import(/* webpackMode: "eager" */ "./components/app.js").then(({ App }) => {
    akariOdango.classList.remove("start-loading");
    akariOdango.classList.add("stop-loading");
    ReactDOM.render(React.createElement(App), document.querySelector(".app-container"));
});
