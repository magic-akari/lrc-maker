/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";

import { render, h } from "preact";
import { action } from "mobx";
import { appState } from "./store/appState.js";
import { lrc } from "./store/lrc.js";
import { Router } from "./store/router.js";
import { polyfill as smoothscroll } from "smoothscroll-polyfill";
import App from "./components/App.jsx";

smoothscroll();

window.h = h;
const router = new Router();

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

action(() => (appState.pageState = appState.PageStates.normal))();
render(App(), document.body, document.body.firstElementChild);

document.body.addEventListener(
  "dragenter",
  action(e => {
    appState.pageState = appState.PageStates.dragging;
    return false;
  }),
  false
);
document.body.addEventListener(
  "dragover",
  e => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    return false;
  },
  false
);
document.body.addEventListener(
  "dragleave",
  action(e => {
    appState.pageState = appState.PageStates.normal;
    return false;
  }),
  false
);
document.body.addEventListener(
  "drop",
  action(e => {
    e.stopPropagation();
    e.preventDefault();
    let file = e.dataTransfer.files[0];
    if (file) {
      if (/^audio\//.test(file.type)) {
        appState.src = file;
      } else if (/^text\//.test(file.type)) {
        let fileReader = new FileReader();
        fileReader.onload = fileReaderEvent => {
          lrc.value = fileReaderEvent.target.result;
          location.hash = Router.editor.path;
        };
        fileReader.readAsText(file);
      }
      appState.pageState = appState.PageStates.normal;
    }
    return false;
  }),
  false
);
console.log(
  "%c",
  "padding:50px;line-height:100px;background:url('https://cloud.githubusercontent.com/assets/7829098/25065994/9d4855ea-224c-11e7-930e-7d82f5597e5e.png') no-repeat;"
);

console.log("欢迎在云音乐关注阿卡琳 Ki⭐️ra http://music.163.com/user/home?id=45441555");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(
    registration => {
      // Registration was successful
      registration.update();
      console.log("ServiceWorker 成功注册 (｡･ω･｡)ﾉ: ", registration.scope);
    },
    err => {
      // registration failed :(
      console.log("ServiceWorker 注册失败 ಥ_ಥ: ", err);
    }
  );
}

window.appLoaded = true;
