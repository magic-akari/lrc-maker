/**
 * Created by 阿卡琳 on 27/06/2017.
 */
"use strict";
import { Component } from "preact";
import { appState } from "../store/appState.js";
import { observable } from "mobx";
import { observer } from "preact-mobx-observer";
import { LockSvg, UnlockSvg } from "./SVG.jsx";

@observer
class LockNodeButton extends Component {
  render() {
    let classNames = ["locknodebutton", "iconbutton"];
    if (appState.lock) classNames.push("locked");
    return (
      <button className={classNames.join(" ")} onClick={appState.toggle_lock}>
        {appState.lock ? LockSvg() : UnlockSvg()}
      </button>
    );
  }
}

export { LockNodeButton };
