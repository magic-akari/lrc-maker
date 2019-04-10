/**
 * Created by 阿卡琳 on 27/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { appState } from "../store/appState.js";
import { LockSvg, UnlockSvg } from "./SVG.jsx";

@observer
class LockNodeButton extends Component {
    render() {
        let classNames = ["locknodebutton", "iconbutton"];
        if (appState.lock) classNames.push("locked");
        return (
            <button tabIndex="-1" className={classNames.join(" ")} onClick={appState.toggle_lock}>
                {appState.lock ? LockSvg() : UnlockSvg()}
            </button>
        );
    }
}

export { LockNodeButton };
