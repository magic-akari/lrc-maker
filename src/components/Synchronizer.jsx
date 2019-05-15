/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { convertTimeToTag, formatText } from "@lrc-maker/lrc-parser";
import { action, autorun, computed } from "mobx";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { elementScrollIntoView } from "seamless-scroll-polyfill";
import { appState } from "../store/appState.js";
import { lrc } from "../store/lrc.js";
import { preferences } from "../store/preferences.js";
import { DownLoadButton } from "./DownLoadButton.jsx";
import { LockNodeButton } from "./LockNodeButton.jsx";

@observer
class CurrentTimeTag extends Component {
    render() {
        return (
            <span className="current-time-tag">
                {convertTimeToTag(appState.currentTime_fixed, preferences.fixed) + "\u27A4"}
            </span>
        );
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
        const scrollIntoView =
            "scrollBehavior" in document.documentElement.style
                ? (element, options) => element.scrollIntoView(options)
                : elementScrollIntoView;
        this.disposers = [
            autorun(() => {
                if (this.trackNode) {
                    scrollIntoView(this.trackNode, {
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest"
                    });
                }
            }),
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
                     * index == data-key
                     */
                    if (index === lrc.highlightIndex) {
                        className.push("highlight");
                    }
                    if (index === lrc.selectedIndex) {
                        className.push("select");
                    }
                    let pre_key = Math.max(index - 1, 0);
                    let pre_time = lrc.lyric[pre_key].time;
                    if (pre_time && pre_time > lyricLine.time) {
                        className.push("error");
                    }

                    const time = lyricLine.time;

                    const lyricTimeTag =
                        time === undefined ? null : (
                            <span className="lyric-time">{convertTimeToTag(time, preferences.fixed)}</span>
                        );

                    return (
                        <li className={className.join(" ")} data-key={index} key={index}>
                            {index == lrc.selectedIndex ? <CurrentTimeTag /> : null}
                            <p className="lyric">
                                {lyricTimeTag}
                                <span class="lyric-text">
                                    {formatText(lyricLine.text, preferences.spaceStart, preferences.spaceEnd)}
                                </span>
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
