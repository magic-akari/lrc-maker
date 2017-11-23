/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { observable, computed, action } from "mobx";
import { preferences } from "./preferences.js";

const appState = new class AppState {
  @observable audioSrc;
  @observable currentTime = 0;
  @observable lock = false;

  set src(value) {
    setTimeout(
      action(() => {
        URL.revokeObjectURL(this.audioSrc);
        this.audioSrc = URL.createObjectURL(value);
      }),
      0
    );
  }

  @computed
  get src() {
    return this.audioSrc;
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
}();

export { appState };
