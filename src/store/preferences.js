/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { action, computed, observable, toJS } from "mobx";
import { languages } from "../languages/index.js";

class Preferences {
    @observable
    trim = true;
    @observable
    fixed = 3;
    @observable
    pretty_tag = true;
    @observable
    built_in_audio = false;
    @observable
    screen_button = false;
    @observable
    dark_mode = false;
    @observable
    lang = "en-US";

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

    @action.bound
    toggle_trim() {
        if (this.trim === true) {
            this.trim = false;
            this.pretty_tag = false;
        } else {
            this.trim = true;
        }
        this.save();
    }

    @action.bound
    toggle_pretty_tag() {
        if (this.pretty_tag === false) {
            this.pretty_tag = true;
            this.trim = true;
        } else {
            this.pretty_tag = false;
        }
        this.save();
    }

    @action.bound
    toggle_audio_player() {
        this.built_in_audio = !this.built_in_audio;
        this.save();
    }

    @action.bound
    toggle_screen_button() {
        this.screen_button = !this.screen_button;
        this.save();
    }

    @action.bound
    toggle_dark_mode() {
        this.dark_mode = !this.dark_mode;
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
}

const preferences = new Preferences();

export { preferences };
