/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
import { action, autorun, configure } from "mobx";
import { h, render } from "preact";
import { App } from "./components/App.jsx";
import { Router } from "./router.js";
import { appState } from "./store/appState.js";
import { lrc } from "./store/lrc.js";
import { preferences } from "./store/preferences.js";

configure({ enforceActions: "always" });
autorun(() => (document.title = preferences.i18n["app"]["fullname"]));
autorun(() => {
    if (preferences.darkMode) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
});

((strProto) => {
    if (!strProto.trimStart) {
        strProto.trimStart =
            strProto.trimLeft ||
            function() {
                return this.replace(/^\s+/, "");
            };
    }

    if (!strProto.trimEnd) {
        strProto.trimEnd =
            strProto.trimRight ||
            function() {
                return this.replace(/\s+$/, "");
            };
    }
})(String.prototype);

render(h(App, { loading: false }), document.body, document.body.firstElementChild);

document.body.addEventListener(
    "dragover",
    (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        return false;
    },
    false
);

document.body.addEventListener(
    "drop",
    action((e) => {
        e.stopPropagation();
        e.preventDefault();
        let file = e.dataTransfer.files[0];
        if (file) {
            if (/^audio\//.test(file.type)) {
                appState.src = file;
            } else if (/^text\//.test(file.type) || /(?:\.lrc|\.txt)$/i.test(file.name)) {
                let fileReader = new FileReader();
                fileReader.onload = (fileReaderEvent) => {
                    lrc.value = fileReaderEvent.target.result;
                    location.hash = Router.editor.path;
                };
                fileReader.readAsText(file);
            }
        }
        return false;
    }),
    false
);
