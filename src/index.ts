import { App } from "./components/app.js";

// let EDGE throw error early
import(/* webpackMode: "eager" */ "./polyfill/smooth-scroll.js");

ReactDOM.render(React.createElement(App), document.querySelector(".app-container"), () => {
    document.querySelector(".page-loading")!.remove();
});
