/**
 * Created by akari on 19/02/2017.
 */
import React, {Component} from "react";

class Editor extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div id="app-editor" className="app-editor app-main-content">
            <section className="tool-bar">
                <button className="tool-bar-button"
                        onClick={() => this.props.onParse(this.textarea.value)}>导入
                </button>
                <button className="tool-bar-button" onClick={() => this.textarea.select()}>全选</button>
                <a ref={a => this.download = a}
                   className="tool-bar-button"
                   href={`data:text/plain;charset=utf-8,${this.props.lyricText}`}
                   download={[new Date().toLocaleString().replace(/\/|,/g, '-'), '.lrc'].join('')}>下载</a>
            </section>
            <textarea ref={textarea => this.textarea = textarea}
                      className="app-textarea"
                      defaultValue={this.props.lyricText}
                      onBlur={() => {
                          let content = this.textarea.value.replace(/\n/g, '\r\n');
                          this.download.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
                      }}
            />
        </div>);
    };
}


export default Editor;