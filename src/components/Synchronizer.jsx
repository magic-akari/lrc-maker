/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observable, action, computed, autorun } from "mobx";
import { observer } from "preact-mobx-observer";
import { lrc, LRC } from "../store/lrc.js";
import { appState } from "../store/appState.js";
import { preferences } from "../store/preferences.js";
import { DownLoadButton } from "./DownLoadButton.jsx";
import { LockNodeButton } from "./LockNodeButton.jsx";

@observer
class CurrentTimeTag extends Component {
    render() {
        return <span className="current-time-tag">{LRC.timeToTag(appState.currentTime_fixed) + "\u27A4"}</span>;
    }
}

const autoDispose = (type, listener, options) => {
    document.addEventListener(type, listener, options);
    return () => document.removeEventListener(type, listener, options);
};

@observer
class SynchronizerList extends Component {
    @computed
    get trackNode() {
        const index = appState.lock ? lrc.highlightIndex : lrc.selectedIndex;
        return this.base.children[index];
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.disposers = [
            autorun(() => {
                if (this.trackNode) {
                    this.trackNode.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest"
                    });
                }
            }),
            autorun(() => {
                if (appState.lock) {
                    document.body.classList.add("freeze");
                } else {
                    document.body.classList.remove("freeze");
                }
            }),
            () => document.body.classList.remove("freeze"),
            autoDispose(
                "keydown",
                (e) => {
                    if (["Backspace", "Delete"].includes(e.code) || ["Backspace", "Delete", "Del"].includes(e.key)) {
                        e.preventDefault();
                        this.deleteTimestamp();
                        return;
                    }
                    if (e.metaKey === true || e.ctrlKey === true) {
                        return;
                    }
                    if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
                        e.preventDefault();

                        sync();
                    } else if (
                        ["ArrowUp", "KeyW", "KeyJ"].includes(e.code) ||
                        ["ArrowUp", "Up", "W", "w", "J", "j"].includes(e.key)
                    ) {
                        e.preventDefault();

                        this.changeSelect(-1);
                    } else if (
                        ["ArrowDown", "KeyS", "KeyK"].includes(e.code) ||
                        ["ArrowDown", "Down", "S", "s", "K", "k"].includes(e.key)
                    ) {
                        e.preventDefault();

                        this.changeSelect(1);
                    } else if (e.code === "Home" || e.key === "Home") {
                        e.preventDefault();

                        this.changeSelect(-1e3);
                    } else if (e.code === "End" || e.key === "End") {
                        e.preventDefault();

                        this.changeSelect(1e3);
                    } else if (e.code === "PageUp" || e.key === "PageUp") {
                        e.preventDefault();

                        this.changeSelect(-10);
                    } else if (e.code === "PageDown" || e.key === "PageDown") {
                        e.preventDefault();

                        this.changeSelect(10);
                    }
                },
                { capture: true }
            )
        ];
    }

    componentWillUnmount() {
        this.disposers.forEach((d) => d());
    }

    @action
    deleteTimestamp() {
        let selectedIndex = lrc.selectedIndex;
        lrc.lyric[selectedIndex].time = undefined;
    }

    @action
    changeSelect(dl) {
        lrc.selectedIndex += dl;
    }

    @action.bound
    selectLine(e) {
        let { key } = e.target.dataset;
        if (key) {
            lrc.selectedIndex = Number(key);
        } else return true;
    }

    render() {
        return (
            <ul className={"lyric-list"} onClick={this.selectLine}>
                {lrc.lyric.map((lyricLine, index) => {
                    const className = ["lyric-line"];
                    /**
                     * lyricLine.key === index == data-key
                     */
                    if (lyricLine.key === lrc.highlightIndex) {
                        className.push("highlight");
                    }
                    if (lyricLine.key === lrc.selectedIndex) {
                        className.push("select");
                    }
                    let pre_key = Math.max(lyricLine.key - 1, 0);
                    let pre_time = lrc.lyric[pre_key].time;
                    if (pre_time && pre_time > lyricLine.time) {
                        className.push("error");
                    }

                    const time = lyricLine.time;

                    const lyricTimeTag =
                        time === undefined ? null : <span className="lyric-time">{LRC.timeToTag(lyricLine.time)}</span>;

                    return (
                        <li className={className.join(" ")} data-key={lyricLine.key} key={lyricLine.key}>
                            {lyricLine.key == lrc.selectedIndex ? <CurrentTimeTag /> : null}
                            <p className="lyric">
                                {lyricTimeTag}
                                {preferences.pretty_tag ? " " : null}
                                <span class="lyric-text">{lyricLine.text}</span>
                            </p>
                        </li>
                    );
                })}
            </ul>
        );
    }
}

const sync = action(() => {
    if (lrc.lyric.length > 0) {
        let selectedIndex = lrc.selectedIndex;
        lrc.lyric[selectedIndex].time = appState.currentTime;
        lrc.selectedIndex += 1;
    }
});

const Synchronizer = () => (
    <div className="synchronizer">
        <SynchronizerList />
        <div className="extra_button_group">
            <LockNodeButton />
            <DownLoadButton />
        </div>
    </div>
);

export { Synchronizer, sync };
