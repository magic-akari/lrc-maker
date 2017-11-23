/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { router, Router } from "../store/router.js";
import { SettingsSvg, EditorSvg, SynchronizerSvg } from "./SVG.jsx";
import { lrc } from "../store/lrc.js";
import { preferences } from "../store/preferences.js";

@observer
class Header extends Component {
  render() {
    return (
      <header className="app-header">
        <div className="wrapper">
          <span className="app-title">{preferences.i18n["app"]["name"]}</span>
          <nav className="app-nav">
            <a
              href={Router.editor.path}
              className={(() => {
                if (router.path === Router.editor.path) {
                  return "active";
                }
                if (
                  router.path === Router.synchronizer.path &&
                  lrc.lyric.length === 0
                ) {
                  return "showtip";
                }
              })()}
              title={Router.editor.title}
            >
              {EditorSvg()}
              <span className="option">{Router.editor.name}</span>
            </a>
            <a
              href={Router.synchronizer.path}
              className={
                router.path === Router.synchronizer.path ? "active" : ""
              }
              title={Router.synchronizer.title}
            >
              {SynchronizerSvg()}
              <span className="option">{Router.synchronizer.name}</span>
            </a>
            <a
              href={Router.preferences.path}
              className={
                router.path === Router.preferences.path ? "active" : ""
              }
              title={Router.preferences.title}
            >
              {SettingsSvg()}
              <span className="option">{Router.preferences.name}</span>
            </a>
          </nav>
        </div>
      </header>
    );
  }
}
export { Header };
