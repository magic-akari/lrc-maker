/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { observable, computed, intercept, observe, action } from "mobx";
import { preferences } from "./preferences.js";

const appState = new class AppState {
  @observable pageState = this.PageStates.loading;
  @observable audioSrc;
  @observable currentTime = 0;
  @observable lock = false;
  @observable.ref _audio;

  set src(value) {
    URL.revokeObjectURL(this.audioSrc);
    this.audioSrc = URL.createObjectURL(value);
  }

  @computed
  get src() {
    return this.audioSrc;
  }

  set audio(value) {
    this._audio = value;
  }

  @computed
  get audio() {
    return this._audio;
  }

  @action.bound
  pause() {
    this.audio.pause();
  }

  @computed
  get paused() {
    if (this.audio) {
      return this.audio.paused;
    }
    return true;
  }

  @computed
  get currentTime_fixed() {
    return (
      ~~(this.currentTime * preferences.fixed_decimal) /
      preferences.fixed_decimal
    );
  }

  @action.bound
  toggle_lock() {
    this.lock = !this.lock;
  }

  PageStates = {
    normal: Symbol("normal"),
    loading: Symbol("loading"),
    dragging: Symbol("dragging")
  };
}();

intercept(appState, "_audio", change => {
  if (change.newValue === null) {
    return null;
  } else {
    if (change.newValue.playbackRate_exp === undefined) {
      Object.defineProperty(change.newValue, "playbackRate_exp", {
        get: function() {
          return Math.log(this.playbackRate);
        },
        set: function(value) {
          this.playbackRate = Math.exp(value);
        }
      });

      change.newValue.addEventListener(
        "play",
        () =>
          (change.newValue.handler = setInterval(
            () => change.newValue.dispatchEvent(new CustomEvent("timeupdate")),
            16
          ))
      );

      change.newValue.addEventListener("pause", () =>
        clearInterval(change.newValue.handler)
      );

      change.newValue.addEventListener("ended", () =>
        clearInterval(change.newValue.handler)
      );

      return change;
    }
    return change;
  }
});

observe(appState, "_audio", change => {
  if (change.oldValue) {
    const resume = () => {
      appState.audio.currentTime = change.oldValue.currentTime;
      appState.audio.volume = change.oldValue.volume;
      appState.audio.playbackRate_exp = change.oldValue.playbackRate_exp;
    };

    try {
      resume();
    } catch (e) {
      appState.audio.onloadedmetadata = resume;
    }

    if (appState.src && !change.oldValue.paused) {
      appState.audio.play();
    }
  }
});

export { appState };
