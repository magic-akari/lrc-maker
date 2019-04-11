/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";

import { action, autorun, configure } from "mobx";
import { h, render } from "preact";
import { seamless } from "seamless-scroll-polyfill";
import { App } from "./components/App.jsx";
import { Router } from "./router.js";
import { appState } from "./store/appState.js";
import { lrc } from "./store/lrc.js";
import { preferences } from "./store/preferences.js";

seamless();

window.h = h;

configure({ enforceActions: true });
autorun(() => (document.title = preferences.i18n["app"]["fullname"]));
autorun(() => {
    if (preferences.dark_mode) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
});

/**
 * polyfill for padStart
 */
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(padString || " ");
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

render(App({ loading: false }), document.body, document.body.firstElementChild);

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
