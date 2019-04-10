/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { appState } from "../store/appState.js";
import { preferences } from "../store/preferences.js";
import { SpaceButton } from "./SpaceButton.jsx";
import { lrc } from "../store/lrc.js";
import { Audio } from "./Audio.jsx";

@observer
class Footer extends Component {
    componentDidMount() {
        document.addEventListener(
            "visibilitychange",
            () => {
                if (document.hidden) {
                    this.audio.pause();
                    lrc.save();
                }
            },
            false
        );

        window.addEventListener("beforeunload", () => {
            lrc.save();
        });

        document.addEventListener(
            "keydown",
            (e) => {
                if (["text", "textarea"].includes(e.target.type)) {
                    return;
                }

                if (e.metaKey === true || e.ctrlKey === true) {
                    if (["ArrowUp", "KeyJ"].includes(e.code) || ["ArrowUp", "Up", "J", "j"].includes(e.key)) {
                        e.preventDefault();

                        const rate = this.audio.playbackRate;
                        const newRate = Math.exp(Math.min(Math.log(rate) + 0.2, 1));

                        this.audio.playbackRate = newRate;
                    } else if (
                        ["ArrowDown", "KeyK"].includes(e.code) ||
                        ["ArrowDown", "Down", "K", "k"].includes(e.key)
                    ) {
                        e.preventDefault();

                        const rate = this.audio.playbackRate;
                        const newRate = Math.exp(Math.max(Math.log(rate) - 0.2, -1));

                        this.audio.playbackRate = newRate;
                    } else if (e.code === "Enter" || e.key === "Enter") {
                        e.preventDefault();

                        this.audio.paused ? this.audio.play() : this.audio.pause();
                    } else if (e.shiftKey === true && (e.code === "KeyP" || e.key === "P" || e.key === "p")) {
                        e.preventDefault();

                        let src = prompt("Input the audio source url.", appState.src);
                        if (src) {
                            appState.src = src;
                        }
                    }
                } else {
                    if (["ArrowLeft", "KeyA"].includes(e.code) || ["ArrowLeft", "Left", "A", "a"].includes(e.key)) {
                        e.preventDefault();

                        this.audio.currentTime -= 5;
                    } else if (
                        ["ArrowRight", "KeyD"].includes(e.code) ||
                        ["ArrowRight", "Right", "D", "d"].includes(e.key)
                    ) {
                        e.preventDefault();

                        this.audio.currentTime += 5;
                    } else if (e.code === "KeyR" || e.key === "R" || e.key === "r") {
                        e.preventDefault();

                        this.audio.playbackRate = 1;
                    }
                }
            },
            { capture: true }
        );

        let urlSearchParams = location.search
            .slice(1)
            .split("&")
            .reduce((params, hash) => {
                let [key, val] = hash.split("=");
                return Object.assign(params, { [key]: decodeURIComponent(val) });
            }, {});

        if (urlSearchParams.audioSrc !== undefined) {
            appState.src = urlSearchParams.audioSrc;
        }
    }

    render() {
        return (
            <footer className="app-footer">
                <SpaceButton />
                <Audio
                    className="app-audio"
                    controls={preferences.built_in_audio}
                    ref={(audio) => {
                        this.audio = audio;
                    }}
                    src={appState.src}
                    onTimeUpdate={(e) => {
                        appState.currentTime = e.target.currentTime;
                    }}
                />
            </footer>
        );
    }
}
export { Footer };
