/**
 * Created by 阿卡琳 on 16/06/2017.
 */
"use strict";
import preact, { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { router, Router } from "../router.js";
import { Editor } from "./Editor.jsx";
import { NotFound } from "./NotFound.jsx";
import { Preferences } from "./Preferences.jsx";
import { Synchronizer } from "./Synchronizer.jsx";

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
