/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { action, computed, observable } from "mobx";
import { preferences } from "./preferences.js";

export const appState = new (class AppState {
    @observable audioSrc = false;
    @observable _currentTime = 0;
    @observable lock = false;

    set src(value) {
        if (typeof value === "string") {
            URL.revokeObjectURL(this.audioSrc);
            this.audioSrc = value;
        } else {
            setTimeout(
                action(() => {
                    URL.revokeObjectURL(this.audioSrc);
                    this.audioSrc = URL.createObjectURL(value);
                }),
                0
            );
        }
    }

    @computed
    get src() {
        return this.audioSrc;
    }

    @computed
    get currentTime_fixed() {
        return ~~(this.currentTime * preferences.fixed_decimal) / preferences.fixed_decimal;
    }

    set currentTime(value) {
        this._currentTime = value;
    }

    @computed
    get currentTime() {
        return this._currentTime;
    }

    @action.bound
    toggle_lock() {
        this.lock = !this.lock;
    }
})();
