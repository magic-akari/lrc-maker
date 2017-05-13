/**
 * Created by akari on 19/02/2017.
 */
import React, { Component } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Editor from "./Editor";
import Creator from "./Creator";
import DragingPage from "./DraggingPage";
import LRC from "../lrc";
import jump from "jump.js";
import Mousetrap from "mousetrap";

const playbackRateList = [0.25, 0.5, 0.66, 0.8, 1.0, 1.25, 1.5, 2.0, 4.0];

class App extends Component {
  constructor(props) {
    super(props);
    let savedState;
    try {
      if (localStorage) {
        savedState = JSON.parse(localStorage.getItem("app-state"));
      }
    } catch (e) {}

    let initState = savedState || {
      editing: true,
      showTimestamp: true,
      selectedIndex: 0,
      highlightIndex: -1,
      elapsedTime: 0,
      showMask: false,
      showAside: false,
      dragging: false,
      checkMode: false,
      showAbout: false,
      showSyncButton: false
    };
    this.state = initState;
  }

  componentDidMount() {
    let url = new URL(window.location);
    let audioSrc = url.searchParams.get("audiosrc");

    if (audioSrc !== null) {
      this.setState({ audioSrc });
    }

    Mousetrap.bind("?", e =>
      this.setState({
        showMask: true,
        showAside: false,
        showAbout: true
      }));

    Mousetrap.bind(["up", "w", "j"], e => {
      this.changeSelectedIndex(this.state.selectedIndex - 1);
      e.preventDefault();
      return false;
    });

    Mousetrap.bind(["down", "s", "k"], e => {
      this.changeSelectedIndex(this.state.selectedIndex + 1);
      e.preventDefault();
      return false;
    });

    Mousetrap.bind("space", e => {
      this.syncLRC();
      e.preventDefault();
      return false;
    });
    Mousetrap.bind(["command+backspace", "delete"], e => {
      this.deleteTimestamp();
      e.preventDefault();
      return false;
    });

    Mousetrap.bind(
      ["command+return", "ctrl+enter"],
      e => this.audio.paused ? this.audio.play() : this.audio.pause()
    );

    Mousetrap.bind(["left", "a"], e => this.audio.currentTime -= 5);
    Mousetrap.bind(["right", "d"], e => this.audio.currentTime += 5);
    Mousetrap.bind(["command+up", "ctrl+up"], e => {
      this.speedup();
      e.preventDefault();
      return false;
    });
    Mousetrap.bind(["command+down", "ctrl+down"], e => {
      this.speeddown();
      e.preventDefault();
      return false;
    });
    Mousetrap.bind("r", e => this.audio.playbackRate = 1.0);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          this.audio.pause();
          this.saveAppState();
        }
      },
      false
    );

    window.onbeforeunload = () => {
      this.saveAppState();
    };
  }

  speedup() {
    if (this.audio !== undefined) {
      this.audio.playbackRate = playbackRateList.find(
        r => r > this.audio.playbackRate
      ) || playbackRateList[playbackRateList.length - 1];
    }
  }

  speeddown() {
    if (this.audio !== undefined) {
      this.audio.playbackRate = playbackRateList
        .filter(r => r < this.audio.playbackRate)
        .reverse()[0] || playbackRateList[0];
    }
  }

  changeSelectedIndex(index) {
    if (this.state.lyric) {
      let max = this.state.lyric.length - 1;
      if (index < 0) index = 0;
      if (index > max) index = max;
      this.setState({ selectedIndex: index }, () => {
        if (this.audio.paused === true || this.state.checkMode == false) {
          let select = document.querySelector(".select");
          if (this.audio.paused || !this.state.checkMode) {
            window.scrollBy(
              0,
              select.getBoundingClientRect().bottom -
                document.documentElement.clientHeight / 2
            );
          }
        }
      });
    }
  }

  updateTime() {
    let elapsedTime = this.audio.currentTime;
    let lyric = this.state.lyric;
    let highlightItemList = lyric &&
      lyric
        .filter(l => l.time !== undefined && l.time < elapsedTime)
        .sort((a, b) => a.time < b.time ? 1 : -1);
    let highlightItem = highlightItemList[0];
    let highlightIndex = highlightItem ? highlightItem.key : -1;
    let oldHighlightIndex = this.state.highlightIndex;
    if (oldHighlightIndex !== highlightIndex && this.state.checkMode == true) {
      let highlightDOM = document.querySelector(".highlight");
      if (highlightDOM) {
        let duration = 1000;
        if (highlightItemList.length > 1) {
          duration = (highlightItemList[0].time - highlightItemList[1].time) *
            250;
        }
        jump(highlightDOM, {
          duration: duration,
          offset: highlightDOM.getBoundingClientRect().height * 2 -
            document.documentElement.clientHeight / 2
        });
      }
    }
    this.setState({ elapsedTime, highlightIndex });
  }

  syncLRC() {
    let time = this.audio.currentTime;
    this.setState({
      lyric: this.state.lyric.map((lyricLine, index) => {
        if (index == this.state.selectedIndex) {
          return { key: lyricLine.key, text: lyricLine.text, time };
        }
        return lyricLine;
      })
    });
    this.changeSelectedIndex(this.state.selectedIndex + 1);
  }

  deleteTimestamp() {
    this.setState({
      lyric: this.state.lyric.map((lyricLine, index) => {
        if (index == this.state.selectedIndex) {
          return { key: lyricLine.key, text: lyricLine.text, time: undefined };
        }
        return lyricLine;
      })
    });
  }

  clearAllTimestamp() {
    this.setState({
      lyric: this.state.lyric.map((lyricLine, index) => {
        return { key: lyricLine.key, text: lyricLine.text, time: undefined };
      })
    });
  }

  onDragEnter(e) {
    this.setState({ dragging: true });
    e.preventDefault();
  }

  onDragLeave(e) {
    this.setState({ dragging: false });
    e.preventDefault();
  }

  onDragOver(e) {
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
  }

  loadFiles(files) {
    let [foundAudio, foundLyric] = [false, false];
    for (let i = 0; i < files.length; i++) {
      if (!foundAudio && /^audio\//.test(files[i].type)) {
        URL.revokeObjectURL(this.state.audioSrc);
        let audioSrc = URL.createObjectURL(files[i]);
        this.setState({
          audioSrc,
          dragging: false
        });
        foundAudio = true;
        continue;
      } else if (!foundLyric) {
        let fileReader = new FileReader();
        fileReader.onload = fileReaderEvent => {
          let lyricText = fileReaderEvent.target.result;
          this.setState({ dragging: true }, () =>
            this.setState({
              lyricText,
              dragging: false,
              editing: true
            }));
        };
        fileReader.readAsText(files[i]);
        foundLyric = true;
        continue;
      }
      if (foundAudio && foundLyric) break;
    }
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    this.loadFiles(files);
    return false;
  }

  saveAppState() {
    localStorage.setItem(
      "app-state",
      JSON.stringify({
        editing: this.state.editing,
        showTimestamp: this.state.showTimestamp,
        showSyncButton: this.state.showSyncButton,
        checkMode: this.state.checkMode,
        selectedIndex: 0,
        highlightIndex: -1,
        elapsedTime: 0,
        showMask: false,
        audioSrc: undefined,
        dragging: false,
        lyric: this.state.lyric,
        lyricText: this.state.lyricText,
        al: this.state.al,
        ti: this.state.ti,
        ar: this.state.ar
      })
    );
  }

  render() {
    return (
      <div
        className="app-root"
        onDragEnter={e => this.onDragEnter(e)}
        onDragLeave={e => this.onDragLeave(e)}
        onDragOver={e => this.onDragOver(e)}
        onDrop={e => this.onDrop(e)}
      >
        <Header
          showSlide={() =>
            this.setState({
              showMask: true,
              showAside: true
            })}
        />
        <main id="app-main" className="app-main wrapper">
          {this.state.dragging
            ? <DragingPage />
            : this.state.editing
                ? <Editor
                    lyricText={this.state.lyricText || ""}
                    onChangeFocus={v => this.setState({ textareaFocused: v })}
                    onParse={text =>
                      this.setState(LRC.parse(text), () =>
                        this.setState({ editing: false }))}
                  />
                : <Creator
                    showTimestamp={this.state.showTimestamp}
                    showSyncButton={this.state.showSyncButton}
                    lyric={this.state.lyric}
                    selectedIndex={this.state.selectedIndex}
                    highlightIndex={this.state.highlightIndex}
                    elapsedTime={this.state.elapsedTime}
                    onChangeSelectedIndex={index =>
                      this.changeSelectedIndex(index)}
                    onSyncLrcLRC={() => this.syncLRC()}
                    onDeleteTimestamp={() => this.deleteTimestamp()}
                    onClearAlleTimestamp={() => this.clearAllTimestamp()}
                    onOutput={() =>
                      this.setState(
                        {
                          lyricText: LRC.stringify({
                            lyric: this.state.lyric,
                            al: this.state.al,
                            ti: this.state.ti,
                            ar: this.state.ar
                          }),
                          editing: true
                        },
                        () => this.saveAppState()
                      )}
                  />}
        </main>
        <Footer
          textareaFocused={this.state.textareaFocused}
          audioSrc={this.state.audioSrc}
          setAudio={audio => this.audio = audio}
          updateTime={() => this.updateTime()}
          showTimestamp={this.state.showTimestamp}
          playbackRate={this.audio ? this.audio.playbackRate : 1}
          checkMode={this.state.checkMode}
        />
        <aside
          className={`app-aside${this.state.showAside ? " is-visible" : ""}`}
        >
          <ul>
            <li className="app-aside-li">
              <button
                className="app-aside-button"
                onClick={() =>
                  this.setState({ showTimestamp: !this.state.showTimestamp })}
              >
                {this.state.showTimestamp ? "隐藏时间轴" : "显示时间轴"}
              </button>
            </li>
            <li className="app-aside-li">
              <button
                className="app-aside-button"
                onClick={() =>
                  this.setState({ checkMode: !this.state.checkMode })}
              >
                {this.state.checkMode ? "切换到打轴模式" : "切换到校对模式"}
              </button>
            </li>
            <li className="app-aside-li">
              <button
                className="app-aside-button"
                onClick={() =>
                  this.setState({ showSyncButton: !this.state.showSyncButton })}
              >
                {this.state.showSyncButton ? "隐藏虚拟按键" : "显示虚拟按键"}
              </button>
            </li>
            <li className="app-aside-li">
              <label htmlFor="upLoadFile" className="app-aside-button">
                导入本地音频&歌词文本
              </label>
              <input
                className="upLoadFile"
                id="upLoadFile"
                type="file"
                multiple
                accept="audio/* , text/*"
                onChange={e => {
                  let files = e.target.files;
                  this.loadFiles(files);
                  this.setState({ showMask: false, showAside: false });
                }}
              />
            </li>
            <li className="app-aside-li">
              <button
                className="app-aside-button"
                onClick={() =>
                  this.setState({
                    showAbout: true,
                    showMask: true,
                    showAside: false
                  })}
              >
                帮助 /
                关于
              </button>
            </li>
          </ul>
        </aside>
        <div
          className={`mask ${this.state.showMask ? "is-visible" : ""}`}
          onClick={() =>
            this.setState({
              showMask: false,
              showAside: false,
              showAbout: false
            })}
        />
        <div
          className={
            `help-and-about-box modal ${this.state.showAbout ? "is-visible" : ""}`
          }
        >
          <div className="modal-inner">
            <section className="help-and-about-section">
              <h1>快捷键</h1>
              <p>播放／暂停：<kbd>command + return / ctrl + enter</kbd></p>
              <p>打轴：<kbd>space</kbd></p>
              <p>删除时间轴：<kbd>command + delete / delete</kbd></p>
              <p>前进5秒：<kbd> ➡️️ / d</kbd></p>
              <p>后退5秒：<kbd> ⬅️️ / a</kbd></p>
              <p>选择上 & 下行歌词：<kbd>⬆️ & ⬇️ / w & s / j & k</kbd></p>
              <p>加速播放：<kbd>command + ⬆️ / ctrl + ⬆️ </kbd></p>
              <p>减速播放：<kbd>command + ⬇️ /ctrl + ⬇️ ️</kbd></p>
              <p>重置速度：<kbd>r</kbd></p>
              <p>显示帮助：<kbd>shift + ?</kbd></p>
            </section>
            <section>
              <h1>使用提示</h1>
              <p>先导入歌词和音频，歌词支持直接输入、拖放、上传的方式导入。</p>
              <p>音频支持拖放、上传、输入外源地址的方式导入。</p>
              <p>导入的歌词支持纯文本，也支持时间轴解析，所以即使导入编辑到一半的歌词也是支持的。</p>
              <p>因此在打轴过程中，可以随时再切换到编辑(导出)模式编辑。</p>
              <h3 style={{ color: "gray", opacity: 0.8 }}>关于如何引用云音乐的音频</h3>
              <p style={{ color: "gray", opacity: 0.8 }}>
                将这个链接
                {" "}
                <a
                  href={
                    `javascript:void(function(u,s)%7Bs=document.body.appendChild(document.createElement('script'));s.src=u+'?ts='+Date.now();s.charset='UTF-8'%7D('//hufan-akari.github.io/LRC-MAKER/user_tool/gotolrcmaker.js'))`
                  }
                >
                  跳转至歌词编辑页面
                </a>
                拖动至/保存至收藏夹，并在单曲页面使用。
              </p>
              <a
                href="https://cloud.githubusercontent.com/assets/7829098/24322142/9a9607e4-1198-11e7-9610-e633bae10ed0.gif"
                target="_blank"
                rel="nofollow noopener noreferre"
              >
                点查看使用演示
              </a>
            </section>
            <section>
              <h1>关于本工具</h1>
              <p>本工具是使用 React 和 HTML5技术制作成的纯前端APP</p>
              <p>
                由
                <a
                  href="http://music.163.com/user/home?id=45441555"
                  target="_blank"
                  rel="nofollow noopener noreferrer me"
                >
                  阿卡林
                </a>
                带着 ❤️ 制作而成。
              </p>
              <p>
                <a
                  href="http://music.163.com/user/home?id=45441555"
                  target="_blank"
                  rel="nofollow noopener noreferrer me"
                >
                  阿卡林
                </a>
                是网易云音乐的忠实用户，仅此而已。
              </p>
              <p>
                使用本工具所遇到的问题，请向
                <a
                  href="https://github.com/hufan-Akari/LRC-MAKER/issues/new"
                  target="_blank"
                  rel="nofollow noopener noreferre"
                >
                  这里
                </a>
                求助。
              </p>
              <p>
                欢迎 star,fork,pull request
                {" "}
                <a
                  href="https://github.com/hufan-Akari/LRC-MAKER"
                  target="_blank"
                  rel="noopener"
                >
                  本项目
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
