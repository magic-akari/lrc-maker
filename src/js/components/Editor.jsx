/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { lrc } from "../store/lrc.js";
import { appState } from "../store/appState.js";
import { DownLoadButton } from "./DownLoadButton.jsx";
import { LoadAudioSvg, LoadTextSvg, SelectAllSvg } from "./SVG.jsx";
import { preferences as pref } from "../store/preferences.js";

@observer
class Editor extends Component {
  constructor(props) {
    super(props);
  }

  static displayName = "Editor";

  componentWillUnmount() {
    lrc.info_set("tool", "歌词滚动姬 (lrc-maker.github.io)");
  }

  updateInfo = e => {
    let value = e.target.value;
    let name = e.target.name;
    if (value.length === 0) {
      lrc.info_delete(name, value);
    } else {
      lrc.info_set(name, value);
    }
  };

  parseText = e => {
    lrc.value = e.target.value;
  };

  uploadAudio = e => {
    let file = e.target.files[0];
    if (file) {
      appState.src = file;
    }
  };

  uploadText = e => {
    let file = e.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = fileReaderEvent => {
        let lyricText = fileReaderEvent.target.result;
        lrc.value = lyricText;
      };
      fileReader.readAsText(file);
    }
  };

  selectAll = () => {
    this.textarea.select();
    document.execCommand("copy");
  };

  setTextarea = textarea => {
    this.textarea = textarea;
  };

  render() {
    return (
      <div className="editor">
        <section className="editor-tool-bar">
          <label for="upload-audio" className="editor-button">
            {LoadAudioSvg()}
            <span className="option">{pref.i18n["lrc"]["load-audio"]}</span>
          </label>
          <input
            id="upload-audio"
            type="file"
            accept="audio/*"
            onChange={this.uploadAudio}
          />
          <label for="upload-text" className="editor-button">
            {LoadTextSvg()}
            <span className="option">{pref.i18n["lrc"]["load-text"]}</span>
          </label>
          <input
            id="upload-text"
            type="file"
            accept="text/*"
            onChange={this.uploadText}
          />
          <span onClick={this.selectAll} className="editor-button">
            {SelectAllSvg()}
            <span className="option">{pref.i18n["lrc"]["select-all"]}</span>
          </span>
        </section>
        <section className="lrc-info-section">
          <section className="lrc-info-input-section">
            <span>{pref.i18n["lrc"]["artist"]}</span>
            <input
              placeholder="ar"
              name="ar"
              onBlur={this.updateInfo}
              value={lrc.info.get("ar")}
            />
          </section>
          <section className="lrc-info-input-section">
            <span>{pref.i18n["lrc"]["album"]}</span>
            <input
              placeholder="al"
              name="al"
              onBlur={this.updateInfo}
              value={lrc.info.get("al")}
            />
          </section>
          <section className="lrc-info-input-section">
            <span>{pref.i18n["lrc"]["title"]}</span>
            <input
              placeholder="ti"
              name="ti"
              onBlur={this.updateInfo}
              value={lrc.info.get("ti")}
            />
          </section>
        </section>
        <textarea
          className="app-textarea"
          placeholder="text"
          onBlur={this.parseText}
          value={lrc.value}
          ref={this.setTextarea}
        />
        <div className="extra_button_group">
          <DownLoadButton />
        </div>
      </div>
    );
  }
}
export { Editor };
