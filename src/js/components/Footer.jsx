/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { action, computed } from "mobx";
import { Audio } from "./Audio.jsx";
import { appState } from "../store/appState.js";
import { preferences } from "../store/preferences.js";
import { SpaceButton } from "./SpaceButton.jsx";
import { lrc } from "../store/lrc.js";

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

    Mousetrap.bind(["left", "a"], e => {
      this.audio.currentTime -= 5;
      e.preventDefault();
      return false;
    });

    Mousetrap.bind(["right", "d"], e => {
      this.audio.currentTime += 5;
      e.preventDefault();
      return false;
    });

    Mousetrap.bind("mod+up", e => {
      const rate = this.audio.playbackRate;
      const newRate = Math.exp(Math.min(Math.log(rate) + 0.2, 1));
      this.audio.playbackRate = newRate;

      e.preventDefault();
      return false;
    });

    Mousetrap.bind("mod+down", e => {
      const rate = this.audio.playbackRate;
      const newRate = Math.exp(Math.max(Math.log(rate) - 0.2, -1));
      this.audio.playbackRate = newRate;

      e.preventDefault();
      return false;
    });

    Mousetrap.bind("r", e => (this.audio.playbackRate = 1));

    Mousetrap.bind(["command+return", "ctrl+enter"], e => {
      this.audio.paused ? this.audio.play() : this.audio.pause();

      e.preventDefault();
      return false;
    });
  }

  // Footer never Unmount
  // componentWillUnmount() {
  //   Mousetrap.unbind([
  //     "left",
  //     "right",
  //     "a",
  //     "d",
  //     "mod+up",
  //     "mod+down",
  //     "r",
  //     "command+return",
  //     "ctrl+enter"
  //   ]);
  // }

  render() {
    return (
      <footer className="app-footer">
        <SpaceButton />
        <Audio
          className="app-audio"
          controls={preferences.use_browser_built_in_audio_player}
          ref={audio => (this.audio = audio)}
          src={appState.src}
          onTimeUpdate={action(
            e => (appState.currentTime = e.target.currentTime)
          )}
        />
      </footer>
    );
  }
}
export { Footer };
