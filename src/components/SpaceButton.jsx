/**
 * Created by 阿卡琳 on 27/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { router, Router } from "../router.js";
import { preferences } from "../store/preferences.js";
import { sync } from "./Synchronizer.jsx";

@observer
class SpaceButton extends Component {
    render() {
        return preferences.screenButton && router.path === Router.synchronizer.path ? (
            <button onClick={sync} className="space_button">
                space
            </button>
        ) : null;
    }
}

export { SpaceButton };
