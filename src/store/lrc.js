/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { parser, stringify } from "@lrc-maker/lrc-parser";
import { action, autorun, computed, observable } from "mobx";
import { appState } from "./appState.js";
import { preferences } from "./preferences.js";

class LRC {
    /** @type {import("mobx").ObservableMap<string, string>} */
    @observable info = new Map();

    /**
     * @typedef ILyric
     * @type {object} ILyric
     * @property {number?} time
     * @property {string} text
     */

    /** @type {import("mobx").IObservableArray<ILyric>} */
    @observable lyric = [];

    @observable _selectedIndex = 0;
    @observable _highlightIndex = -Infinity;

    @computed
    get selectedIndex() {
        return this._selectedIndex;
    }

    set selectedIndex(index) {
        if (isNaN(index) || index < 0) {
            index = 0;
        }
        if (index > this.lyric.length - 1) {
            index = this.lyric.length - 1;
        }
        this._selectedIndex = index;
    }

    @computed
    get highlightIndex() {
        return this._highlightIndex;
    }

    set highlightIndex(index) {
        this._highlightIndex = index;
    }

    static get storageName() {
        return "lrc-maker-lyric";
    }

    constructor() {
        try {
            this.value = localStorage.getItem(LRC.storageName);
        } catch (e) {}
    }

    save = () => {
        try {
            localStorage.setItem(LRC.storageName, this.value);
        } catch (e) {}
    };

    set value(text) {
        const { lyric, info } = parser(text, {
            trimStart: preferences.spaceStart !== -1,
            trimEnd: preferences.spaceEnd !== -1
        });

        this.lyric.replace(lyric);
        this.info.replace(info);

        this.selectedIndex += 0;
    }

    @action.bound
    info_set(name, value) {
        this.info.set(name, value);
    }

    @action.bound
    info_delete(name) {
        this.info.delete(name);
    }

    @computed
    get value() {
        return stringify(this, preferences);
    }
}

const record = {
    currentTime: Infinity,
    currentIndex: Infinity,
    nextTime: -Infinity,
    nextIndex: -Infinity
};

export const lrc = new LRC();

autorun(() => {
    const audioTime = appState.currentTime;
    const lyric = lrc.lyric;

    if (audioTime >= record.currentTime && audioTime < record.nextTime) {
        return;
    }

    Object.assign(
        record,
        lyric.reduce(
            (p, c, i) => {
                if (c.time) {
                    if (c.time < p.nextTime && c.time > audioTime) {
                        p.nextTime = c.time;
                        p.nextIndex = i;
                    }
                    if (c.time > p.currentTime && c.time <= audioTime) {
                        p.currentTime = c.time;
                        p.currentIndex = i;
                    }
                }
                return p;
            },
            {
                currentTime: -Infinity,
                currentIndex: -Infinity,
                nextTime: Infinity,
                nextIndex: Infinity
            }
        )
    );

    lrc.highlightIndex = record.currentIndex;
});
