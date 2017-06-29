/**
 * Created by 阿卡琳 on 27/06/2017.
 */
"use strict";
import { Component } from "preact";
import { lrc } from "../store/lrc.js";
import { observable, action, computed, createTransformer } from "mobx";
import { observer } from "../lib/observer.js";
import { DownloadSvg } from "./SVG.jsx";

@observer
class DownLoadButton extends Component {
  @observable href;
  lrcString;

  @action.bound
  handleClick(e) {
    let lrcString = lrc.value;
    if (this.lrcString != lrcString) {
      this.lrcString = lrcString;
      URL.revokeObjectURL(this.href);
      this.href = URL.createObjectURL(
        new Blob([lrcString], { type: "text/plain" })
      );
    }
  }

  render() {
    return (
      <a
        className="download iconbutton"
        download={(lrc.info.get("ti") || new Date()) + ".lrc"}
        href={this.href}
        onClick={this.handleClick}
      >
        {DownloadSvg()}
      </a>
    );
  }
}

export { DownLoadButton };
