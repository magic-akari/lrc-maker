/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "../lib/observer.js";
import { router, Router } from "../store/router.js";
import { SettingsSvg, EditorSvg, SynchronizerSvg } from "./SVG.jsx";
@observer
class Header extends Component {
  render() {
    return (
      <header className="app-header">
        <div className="wrapper">
          <span className="app-title">歌词滚动姬</span>
          <nav className="app-nav">
            <a
              href={Router.editor.path}
              className={router.path === Router.editor.path ? "active" : ""}
            >
              {EditorSvg()}
              <span className="option">
                {Router.editor.title}
              </span>
            </a>
            <a
              href={Router.synchronizer.path}
              className={
                router.path === Router.synchronizer.path ? "active" : ""
              }
            >
              {SynchronizerSvg()}
              <span className="option">
                {Router.synchronizer.title}
              </span>
            </a>
            <a
              href={Router.preferences.path}
              className={
                router.path === Router.preferences.path ? "active" : ""
              }
            >
              {SettingsSvg()}
              <span className="option">
                {Router.preferences.title}
              </span>
            </a>
          </nav>
        </div>
      </header>
    );
  }
}
export { Header };
