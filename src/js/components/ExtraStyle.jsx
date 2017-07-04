/**
 * Created by 阿卡琳 on 28/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "../lib/observer.js";
import { preferences } from "../store/preferences.js";
import { appState } from "../store/appState.js";
import { Router, router } from "../store/router.js";

@observer
class ExtraStyle extends Component {
  render() {
    const styleList = [];
    if (preferences.night_mode) {
      styleList.push("html,body,main{background-color: #111;color: #eee;}");
    }
    if (appState.lock && router.path === Router.synchronizer.path) {
      styleList.push(".app{position:fixed}");
    }

    return !!styleList.length
      ? <style>
          {styleList.join("")}
        </style>
      : null;
  }
}

export { ExtraStyle };
