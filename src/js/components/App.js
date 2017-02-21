/**
 * Created by akari on 19/02/2017.
 */
import React, {Component} from "react";
import Header from "./Header";
import Footer from "./Footer";
import Editor from "./Editor";
import Creator from "./Creator";
import DragingPage from "./DraggingPage";
import LRC from "../lrc";
import {ShortcutManager} from "react-shortcuts";
import keymap from "../keymap";
import jump from "jump.js";

const shortcutManager = new ShortcutManager(keymap);

class App extends Component {
    constructor(props) {
        super(props);
        let initState = {
            editing: true,
            showTimestamp: true,
            selectedIndex: 0,
            highlightIndex: -1,
            elapsedTime: 0,
            showMask: false,
            showAside: false,
            audiosrc: undefined,
            dragging: false,
            checkMode: false,
            showAbout: false,
            showSyncButton: false
        };
        try {
            if (localStorage) {
                initState = JSON.parse(localStorage.getItem('app-state')) || initState;
            }
        } catch (e) {
        }

        this.state = initState;
    }

    componentDidMount() {
        let audiosrc = /(^|\?|&)audiosrc=(.*)(&|$)/.exec(location.search);
        if (audiosrc) {
            this.setState({audiosrc: audiosrc[2]})
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.audio.pause();
                this.saveAppState();
            }
        }, false);

        window.onbeforeunload = () => {
            this.saveAppState();
        }
    }

    changeSelectedIndex(index) {
        if (this.state.lyric) {
            let max = this.state.lyric.length - 1;
            if (index < 0) index = 0;
            if (index > max) index = max;
            this.setState({selectedIndex: index}, () => {
                if (this.audio.paused === true || this.state.checkMode == false) {
                    jump('.select', {duration: 100, offset: -(document.documentElement.clientHeight / 2)});
                }
            });

        }
    }

    updateTime() {
        let elapsedTime = this.audio.currentTime;
        let lyric = this.state.lyric;
        let highlightItemList =
            lyric && lyric.filter(l => l.time && l.time < elapsedTime)
                .sort((a, b) => a.time < b.time ? 1 : -1);
        let highlightItem = highlightItemList[0];
        let highlightIndex = highlightItem ? highlightItem.key : -1;
        let oldHighlightIndex = this.state.highlightIndex;
        if (oldHighlightIndex !== highlightIndex && this.state.checkMode == true) {
            let highlightDOM = document.querySelector('.highlight');
            if (highlightDOM) {
                let duration = 1000;
                if (highlightItemList.length > 1) {
                    duration = (highlightItemList[0].time - highlightItemList[1].time) * 250;
                }
                jump(highlightDOM, {duration: duration, offset: -(document.documentElement.clientHeight / 2)});
            }
        }
        this.setState({elapsedTime, highlightIndex})
    }

    syncLRC() {
        let time = this.audio.currentTime;
        this.setState({
            lyric: this.state.lyric.map((lyricLine, index) => {
                if (index == this.state.selectedIndex) {
                    return {key: lyricLine.key, text: lyricLine.text, time}
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
                    return {key: lyricLine.key, text: lyricLine.text, time: undefined}
                }
                return lyricLine;
            }),
            selectedIndex: this.state.selectedIndex + 1
        })
    }


    getChildContext() {
        return {shortcuts: shortcutManager}
    }

    onDragEnter(e) {
        this.setState({dragging: true});
        e.preventDefault();
    }

    onDragLeave(e) {
        this.setState({dragging: false});
        e.preventDefault();
    }

    onDragOver(e) {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }

    loadFiles(files) {
        const fileReader = new FileReader();
        let [foundAudio, foundLyric] = [false, false];
        for (let i in files) {
            if (files.hasOwnProperty(i)) {
                if (/^audio\//.test(files[i].type)) {
                    fileReader.onload = fileReaderEvent => {
                        this.setState({audioSrc: fileReaderEvent.target.result, dragging: false});
                    };
                    fileReader.readAsDataURL(files[i]);
                    foundAudio = true;
                    continue;
                } else {
                    fileReader.onload = fileReaderEvent => {
                        this.setState({lyricText: fileReaderEvent.target.result, dragging: false, editing: true});
                    };
                    fileReader.readAsText(files[i]);
                    foundLyric = true;
                }
                if (foundAudio && foundLyric) {
                    break;
                }
            }
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
        localStorage.setItem('app-state', JSON.stringify({
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
            ar: this.state.ar,
        }))
    }

    render() {
        return (<div className="app-root"
                     onDragEnter={(e) => this.onDragEnter(e)}
                     onDragLeave={(e) => this.onDragLeave(e)}
                     onDragOver={(e) => this.onDragOver(e)}
                     onDrop={(e) => this.onDrop(e)}>
            <Header showSlide={() => this.setState({
                showMask: true,
                showAside: true
            })}/>
            <main id="app-main" className="app-main wrapper">
                {this.state.dragging ?
                    <DragingPage/> :
                    this.state.editing ?
                        <Editor lyricText={this.state.lyricText || ''}
                                onParse={text => this.setState(LRC.parse(text), () => this.setState({editing: false}))}/> :
                        <Creator showTimestamp={this.state.showTimestamp}
                                 showSyncButton={this.state.showSyncButton}
                                 lyric={this.state.lyric}
                                 selectedIndex={this.state.selectedIndex}
                                 highlightIndex={this.state.highlightIndex}
                                 elapsedTime={this.state.elapsedTime}
                                 onChangeSelectedIndex={index => this.changeSelectedIndex(index)}
                                 onSyncLrcLRC={() => this.syncLRC()}
                                 onDeleteTimestamp={() => this.deleteTimestamp()}
                                 onOutput={() => this.setState({
                                     lyricText: LRC.stringify({
                                         lyric: this.state.lyric,
                                         al: this.state.al,
                                         ti: this.state.ti,
                                         ar: this.state.ar
                                     }),
                                     editing: true
                                 }, () => this.saveAppState())}
                        />
                }
            </main>
            <Footer audioSrc={this.state.audioSrc}
                    setAudio={audio => this.audio = audio}
                    updateTime={() => this.updateTime()}
                    audio={this.audio}
                    showTimestamp={this.state.showTimestamp}
                    playbackRate={this.state.playbackRate}
                    setPlaybackRate={rate => this.setState({playbackRate: rate})}
            />
            <aside className={`app-aside${this.state.showAside ? ' is-visible' : ''}`}>
                <ul>
                    <li className="app-aside-li">
                        <button className="app-aside-button"
                                onClick={() => this.setState({showTimestamp: !this.state.showTimestamp})}>{this.state.showTimestamp ? '隐藏时间轴' : '显示时间轴'}</button>
                    </li>
                    <li className="app-aside-li">
                        <button className="app-aside-button"
                                onClick={() => this.setState({checkMode: !this.state.checkMode})}>{this.state.checkMode ? '切换到编辑模式' : '切换到校对模式'}</button>
                    </li>
                    <li className="app-aside-li">
                        <button className="app-aside-button"
                                onClick={() => this.setState({showSyncButton: !this.state.showSyncButton})}>{this.state.showSyncButton ? '隐藏虚拟按键' : '显示虚拟按键'}</button>
                    </li>
                    <li className="app-aside-li">
                        <label htmlFor="upLoadFile" className="app-aside-button">导入本地音频&歌词文本</label>
                        <input className="upLoadFile" id="upLoadFile" type="file" multiple accept="audio/* , text/*"
                               onChange={e => {
                                   let files = e.target.files;
                                   this.loadFiles(files);
                                   this.setState({showMask: false, showAside: false})
                               }}
                        />
                    </li>
                    <li className="app-aside-li">
                        <button className="app-aside-button" onClick={() => {
                            let url = prompt('请输入外源音频');
                            if (url) {
                                this.setState({audioSrc: url, showMask: false, showAside: false});
                            }
                        }}>拉取外源音频
                        </button>
                    </li>
                    <li className="app-aside-li">
                        <button className="app-aside-button"
                                onClick={() => this.setState({showAbout: true, showMask: true, showAside: false})}>帮助 /
                            关于
                        </button>
                    </li>
                </ul>
            </aside>
            <div className={`mask ${this.state.showMask ? 'is-visible' : ''}`}
                 onClick={() => this.setState({showMask: false, showAside: false, showAbout: false})}
            ></div>
            <div className={`help-and-about-box modal ${this.state.showAbout ? 'is-visible' : ''}`}>
                <div className="modal-inner">
                    <section className="help-and-about-section">
                        <h1>快捷键</h1>
                        <p>播放／暂停：<kbd>command + return / ctrl + enter</kbd></p>
                        <p>打轴：<kbd>space</kbd></p>
                        <p>前进5秒：<kbd>command + ➡️ ／ ctrl + ➡️️</kbd></p>
                        <p>后退5秒：<kbd>command + ⬅️ / ctrl + ⬅️</kbd></p>
                        <p>选择上 & 下行歌词：<kbd>⬆️ & ⬇️</kbd></p>
                        <p>加速播放：<kbd>command + ⬆️️️ / ctrl + ⬆️️️</kbd></p>
                        <p>减速播放：<kbd>command + ⬇️ /ctrl + ⬇️</kbd></p>
                        <p>重置速度：<kbd>r</kbd></p>
                    </section>
                    <section>
                        <h1>使用提示</h1>
                        <p>先导入歌词和音频，歌词支持直接输入、拖放、上传的方式导入。</p>
                        <p>音频支持拖放、上传、输入外源地址的方式导入。</p>
                        <p>导入的歌词支持纯文本，也支持时间轴解析，所以即使导入编辑到一半的歌词也是支持的。</p>
                        <p>因此在打轴过程中，可以随时再切换到编辑(导出)模式编辑。</p>
                    </section>
                    <section>
                        <h1>关于本工具</h1>
                        <p>本工具是使用 React 和 HTML5技术制作成的纯前端APP</p>
                        <p>由<a href="http://music.163.com/user/home?id=45441555" target="_blank">阿卡林</a>带着 ❤️ 制作而成。</p>
                        <p><a href="http://music.163.com/user/home?id=45441555" target="_blank">阿卡林</a>是网易云音乐的忠实用户，仅此而已。
                        </p>
                        <p>使用本工具所遇到的问题，请向<a href="https://github.com/hufan-Akari/LRC-MAKER/issues/new"
                                            target="_blank">这里</a>求助。</p>
                        <p>欢迎 star,fork,pull request <a href="https://github.com/hufan-Akari/LRC-MAKER" target="_blank">本项目</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>);
    }
}

App.childContextTypes = {
    shortcuts: React.PropTypes.object.isRequired
};

export default App;
