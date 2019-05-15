/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { action, computed, observable, toJS } from "mobx";
import { languages } from "../languages/index.js";

export const preferences = new (class Preferences {
    @observable fixed = 3;
    @observable spaceStart = 1;
    @observable spaceEnd = -1;
    @observable builtInAudio = false;
    @observable screenButton = false;
    @observable darkMode = false;
    @observable lang = "en-US";

    themeColor = "#f58ea8";

    @computed
    get i18n() {
        return languages[this.lang] || languages["en-US"];
    }

    @computed
    get fixed_decimal() {
        return Math.pow(10, this.fixed);
    }

    static get storageName() {
        return "lrc-maker-preferences";
    }

    constructor() {
        try {
            this.lang = ((lang) => (lang in languages ? lang : "en-US"))(navigator.language);

            const p = JSON.parse(localStorage.getItem(Preferences.storageName));
            for (let [key, value] of Object.entries(p)) {
                if (key in this) {
                    this[key] = value;
                }
            }
        } catch (e) {}
    }

    save() {
        try {
            localStorage.setItem(Preferences.storageName, JSON.stringify(toJS(this, false)));
        } catch (e) {}
    }

    /** @param {number} value */
    @action.bound
    set_spaceStart(value) {
        this.spaceStart = value;
        this.save();
    }

    /** @param {number} value */
    @action.bound
    set_spaceEnd(value) {
        this.spaceEnd = value;
        this.save();
    }

    @action.bound
    toggle_audio_player() {
        this.builtInAudio = !this.builtInAudio;
        this.save();
    }

    @action.bound
    toggle_screen_button() {
        this.screenButton = !this.screenButton;
        this.save();
    }

    @action.bound
    toggle_dark_mode() {
        this.darkMode = !this.darkMode;
        this.save();
    }

    @action.bound
    add_fixed() {
        if (this.fixed < 3) {
            this.fixed += 1;
            this.save();
        }
    }

    @action.bound
    minus_fixed() {
        if (this.fixed > 0) {
            this.fixed -= 1;
            this.save();
        }
    }

    set language(value) {
        this.lang = value;
        this.save();
    }

    @computed
    get language() {
        return this.lang;
    }
})();
