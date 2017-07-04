/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { observable, computed } from "mobx";
import { preferences } from "./preferences.js";
import { appState } from "./appState.js";

class LRC {
  @observable info = new Map();
  @observable lyric = [];

  @observable _selectedIndex = 0;
  @computed
  get selectedIndex() {
    return this._selectedIndex;
  }

  set selectedIndex(value) {
    let _value = value;
    if (isNaN(_value) || _value < 0) {
      _value = 0;
    }
    if (_value > this.lyric.length - 1) {
      _value = this.lyric.length - 1;
    }
    this._selectedIndex = _value;
  }
  @computed
  get highlightIndex() {
    const currentTime = appState.currentTime;
    const highlighted = this.lyric
      .filter(l => l.time !== undefined && l.time < currentTime)
      .sort((a, b) => (a.time < b.time ? 1 : -1));
    return highlighted.length === 0 ? 0 : highlighted[0].key;
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
    this.info.clear();
    this.lyric.clear();

    const list = text.split(/\r\n|[\r\n]/);

    const time_tag = /\[\s*(\d{1,3}):(\d{1,2}(?:[:.]\d{1,3})?)\s*](.*)/;
    const info_tag = /\[\s*(\w{1,6})\s*:(.*)]/;

    for (let line of list) {
      const r_time_tag = time_tag.exec(line);
      if (r_time_tag !== null) {
        // babili-webpack-plugin 的解构压缩有bug
        // let [_, mm, ss, text] = r_time_tag;
        let mm = r_time_tag[1];
        let ss = r_time_tag[2];
        let text = r_time_tag[3];
        ss = ss.replace(":", ".");
        [mm, ss] = [parseInt(mm), parseFloat(ss)];
        if (preferences.trim) {
          text = text.trim();
        }
        this.lyric.push({ key: this.lyric.length, time: mm * 60 + ss, text });
      } else {
        const r_info_tag = info_tag.exec(line);
        if (r_info_tag !== null) {
          this.info.set(r_info_tag[1], r_info_tag[2]);
        } else {
          let text = line;
          if (preferences.trim) {
            text = text.trim();
          }
          this.lyric.push({ key: this.lyric.length, text, time: undefined });
        }
      }
    }
  }

  static timeToTag(time) {
    // if (isNaN(time)) {
    //   return "[--:--.--]";
    // }
    const fixed = preferences.fixed;
    const m = ("" + ~~(time / 60)).padStart(2, "0");
    const s_ms = (time % 60)
      .toFixed(fixed)
      .padStart(fixed ? fixed + 3 : 2, "0");
    return `[${m}:${s_ms}]`;
  }

  @computed
  get value() {
    const result = [];
    const info_list = this.info.entries();
    for (let i of info_list) {
      result.push(`[${i[0]}:${i[1]}]`);
    }
    for (let l of this.lyric) {
      const { time, text } = l;
      const space = preferences.space_between_tag_text ? " " : "";
      if (time !== undefined && !isNaN(time)) {
        result.push(LRC.timeToTag(time, preferences) + space + text);
      } else {
        result.push(text);
      }
    }
    return result.join("\r\n");
  }
}

const lrc = new LRC();
export { LRC, lrc };
