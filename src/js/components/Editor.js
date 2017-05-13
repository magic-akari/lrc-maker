/**
 * Created by akari on 19/02/2017.
 */
import React, { Component } from "react";

class Editor extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.props.onChangeFocus(false);
  }

  render() {
    return (
      <div id="app-editor" className="app-editor app-main-content">
        <section className="tool-bar">
          <button
            className="tool-bar-button"
            onClick={() => this.props.onParse(this.textarea.value)}
          >
            导入/打轴
          </button>
          <button
            className="tool-bar-button"
            onClick={() => {
              this.textarea.select();
              document.execCommand("copy");
            }}
          >
            全选复制
          </button>
          <a
            ref={a => this.download = a}
            className="tool-bar-button"
            href={
              `data:text/plain;charset=utf-8,${this.props.lyricText.replace(/\n/g, "\r\n")}`
            }
            download="download.lrc"
          >
            下载
          </a>
        </section>
        <textarea
          autoFocus="autoFocus"
          className="app-textarea"
          ref={textarea => this.textarea = textarea}
          defaultValue={this.props.lyricText}
          onBlur={() => {
            this.props.onChangeFocus(false);
            let content = this.textarea.value.replace(/\n/g, "\r\n");
            this.download.href = "data:text/plain;charset=utf-8," +
              encodeURIComponent(content);
          }}
          onFocus={() => this.props.onChangeFocus(true)}
          placeholder="将音频，文本拖入本页面；或使用菜单里的「导入本地音频&amp;歌词文本」按钮"
        />
      </div>
    );
  }
}

export default Editor;
