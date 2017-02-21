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
            audioSrc: '',
            dragging: false,
            checkMode: false,
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

    onDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const fileReader = new FileReader();
        const files = e.dataTransfer.files;
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
        return false;
    }

    saveAppState() {
        localStorage.setItem('app-state', JSON.stringify({
            editing: this.state.editing,
            showTimestamp: this.state.showTimestamp,
            checkMode: this.state.checkMode,
            selectedIndex: 0,
            highlightIndex: -1,
            elapsedTime: 0,
            showMask: false,
            audioSrc: '',
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
            <Header showSlide={() => this.setState({showMask: true})}/>
            <main id="app-main" className="app-main wrapper">
                {this.state.dragging ?
                    <DragingPage/> :
                    this.state.editing ?
                        <Editor lyricText={this.state.lyricText}
                                onParse={text => this.setState(LRC.parse(text), () => this.setState({editing: false}))}/> :
                        <Creator showTimestamp={this.state.showTimestamp}
                                 onChangeShowTimestamp={v => this.setState({showTimestamp: v})}
                                 checkMode={this.state.checkMode}
                                 onChangeCheckMode={v => this.setState({checkMode: v})}
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
            />
            <div className={`mask ${this.state.showMask ? 'is-visible' : ''}`}
                 onClick={() => this.setState({showMask: false})}
            ></div>
        </div>);
    }
}

App.childContextTypes = {
    shortcuts: React.PropTypes.object.isRequired
};

export default App;
