/**
 * Created by 阿卡琳 on 16/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { router, Router } from "../router.js";
import { preferences } from "../store/preferences.js";
import { NotFound } from "./NotFound.jsx";
import { Editor } from "./Editor.jsx";
import { Synchronizer } from "./Synchronizer.jsx";
import { Preferences } from "./Preferences.jsx";

@observer
class Content extends Component {
    match() {
        switch (router.path) {
            case "":
            case Router.editor.path:
                return <Editor />;
            case Router.synchronizer.path:
                return <Synchronizer />;
            case Router.preferences.path:
                return <Preferences />;
        }
        return NotFound();
    }

    render() {
        return <div className="app-content">{this.match()}</div>;
    }
}

export { Content };
