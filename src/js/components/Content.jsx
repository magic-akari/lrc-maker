/**
 * Created by 阿卡琳 on 16/06/2017.
 */
"use strict";
import { Component } from "preact";
import { NotFound } from "./NotFound.jsx";
import { Loading } from "./Loading.jsx";
import { DragAndDrop } from "./DragAndDrop.jsx";
import { Editor } from "./Editor.jsx";
import { Synchronizer } from "./Synchronizer.jsx";
import { Preferences } from "./Preferences.jsx";
import { router, Router } from "../store/router.js";
import { observer } from "../lib/observer.js";
import { appState } from "../store/appState.js";

@observer
class Content extends Component {
  match() {
    switch (appState.pageState) {
      case appState.PageStates.loading:
        return Loading();
      case appState.PageStates.dragging:
        return DragAndDrop();
      case appState.PageStates.normal:
        switch (router.path) {
          case "":
          case Router.editor.path:
            return <Editor />;
          case Router.synchronizer.path:
            return <Synchronizer />;
          case Router.preferences.path:
            return <Preferences />;
        }
    }
    return NotFound();
  }

  render() {
    return (
      <div className="app-content">
        {this.match()}
      </div>
    );
  }
}

export { Content };
