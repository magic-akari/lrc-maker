/**
 * Created by 阿卡琳 on 27/06/2017.
 */
"use strict";
import { Component } from "preact";
import { sync } from "./Synchronizer.jsx";
import { router, Router } from "../store/router.js";
import { observer } from "../lib/observer.js";
import { preferences } from "../store/preferences.js";

@observer
class SpaceButton extends Component {
  render() {
    return preferences.use_space_button_on_screen &&
    router.path === Router.synchronizer.path
      ? <button onClick={sync} className="space_button">
          space
        </button>
      : null;
  }
}

export { SpaceButton };
