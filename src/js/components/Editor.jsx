/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { action } from "mobx";
import { observer } from "../lib/observer";
import { lrc } from "../store/lrc.js";
import { appState } from "../store/appState.js";
import { DownLoadButton } from "./DownLoadButton.jsx";

@observer
class Editor extends Component {
  constructor(props) {
    super(props);
  }

  static displayName = "Editor";

  componentDidMount() {
    Mousetrap.bind("mod+o", e => {
      e.preventDefault();
      e.stopPropagation();
      console.log("mod+o");
      this.uploadAudioInput.click();
      return false;
    });
  }

  @action
  componentWillUnmount() {
    lrc.info.set("tool", "灯里的歌词滚动姬");
    Mousetrap.unbind("mod+o");
  }

  @action
  updateInfo = e => {
    let value = e.target.value;
    let name = e.target.name;
    if (value.length === 0) {
      lrc.info.delete(name, value);
    } else {
      lrc.info.set(name, value);
    }
  };

  @action
  parseText = e => {
    lrc.value = e.target.value;
  };

  @action
  uploadAudio = e => {
    let file = e.target.files[0];
    if (file) {
      appState.src = file;
    }
  };

  @action
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

  render() {
    return (
      <div className="editor">
        <section className="editor-tool-bar">
          <label for="upload-audio" className="editor-button">
            <svg
              fill="#000000"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              <path d="M19.00,15.50l0,-2.99l-1.49,0l0,2.99l-2.99,0l0,1.49l2.99,0l0,2.99l1.49,0l0,-2.99l2.99,0l0,-1.49l-2.99,0Z" />
            </svg>
            <span className="option">加载音频</span>
          </label>
          <input
            id="upload-audio"
            type="file"
            accept="audio/*"
            onChange={this.uploadAudio}
            ref={input => (this.uploadAudioInput = input)}
          />
          <label for="upload-text" className="editor-button">
            <svg
              fill="#000000"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z" />
            </svg>
            <span className="option">加载文本</span>
          </label>
          <input
            id="upload-text"
            type="file"
            accept="text/*"
            onChange={this.uploadText}
          />
          <span onClick={this.selectAll} className="editor-button">
            <svg
              fill="#000000"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z" />
            </svg>
            <span className="option">全选复制</span>
          </span>
        </section>
        <section className="lrc-info-section">
          <section className="lrc-info-input-section">
            <span>艺人名</span>
            <input
              placeholder="ar"
              name="ar"
              onBlur={this.updateInfo}
              value={lrc.info.get("ar")}
            />
          </section>
          <section className="lrc-info-input-section">
            <span>所属专辑</span>
            <input
              placeholder="al"
              name="al"
              onBlur={this.updateInfo}
              value={lrc.info.get("al")}
            />
          </section>
          <section className="lrc-info-input-section">
            <span>歌曲名</span>
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
          ref={textarea => (this.textarea = textarea)}
        />
        <div className="extra_button_group">
          <DownLoadButton />
        </div>
      </div>
    );
  }
}
export { Editor };
