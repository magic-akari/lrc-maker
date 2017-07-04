/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "../lib/observer.js";
import { action, computed } from "mobx";
import { Audio } from "./Audio.jsx";
import { appState } from "../store/appState.js";
import { preferences } from "../store/preferences.js";
import { SpaceButton } from "./SpaceButton.jsx";
import { lrc } from "../store/lrc.js";

@observer
class Footer extends Component {
  constructor(props) {
    super(props);
    try {
      document.addEventListener(
        "visibilitychange",
        () => {
          if (document.hidden) {
            appState.pause();
            lrc.save();
          }
        },
        false
      );

      window.addEventListener("beforeunload", () => {
        lrc.save();
      });
    } catch (e) {}
  }

  componentDidMount() {
    Mousetrap.bind(["left", "a"], e => {
      appState.audio.currentTime -= 5;
      e.preventDefault();
      return false;
    });

    Mousetrap.bind(["right", "d"], e => {
      appState.audio.currentTime += 5;
      e.preventDefault();
      return false;
    });

    Mousetrap.bind("mod+up", e => {
      appState.audio.playbackRate_exp += 0.2;
      e.preventDefault();
      return false;
    });

    Mousetrap.bind("mod+down", e => {
      appState.audio.playbackRate_exp -= 0.2;
      e.preventDefault();
      return false;
    });

    Mousetrap.bind("r", e => (appState.audio.playbackRate_exp = 0));

    Mousetrap.bind(["command+return", "ctrl+enter"], e => {
      if (appState.audio.src) {
        appState.audio.paused ? appState.audio.play() : appState.audio.pause();
      }
      e.preventDefault();
      return false;
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind([
      "left",
      "right",
      "a",
      "d",
      "mod+up",
      "mod+down",
      "r",
      "command+return",
      "ctrl+enter"
    ]);
  }

  @action.bound
  syncTime(e) {
    appState.currentTime = ~~(e.target.currentTime * 1000) / 1000;
  }

  @computed
  get Audio1() {
    return (
      <audio
        controls={true}
        onTimeUpdate={this.syncTime}
        src={appState.src}
        ref={audio => (appState.audio = audio)}
      />
    );
  }

  @computed
  get Audio2() {
    return (
      <Audio
        className="app-audio"
        onTimeUpdate={this.syncTime}
        src={appState.src}
        ref={audio => (appState.audio = audio)}
      />
    );
  }

  render() {
    return (
      <footer className="app-footer">
        <SpaceButton />
        {preferences.use_browser_built_in_audio_player
          ? this.Audio1
          : this.Audio2}
      </footer>
    );
  }
}
export { Footer };
