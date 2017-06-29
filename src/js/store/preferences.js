/**
 * Created by 阿卡琳 on 18/06/2017.
 */
"use strict";
import { observable, action, toJS, computed } from "mobx";
import { appState } from "./appState.js";

class Preferences {
  @observable trim = true;
  @observable fixed = 3;
  @observable space_between_tag_text = true;
  @observable use_browser_built_in_audio_player = false;
  @observable use_space_button_on_screen = false;
  @observable night_mode = false;
  @computed
  get fixed_decimal() {
    return Math.pow(10, this.fixed);
  }

  static get storageName() {
    return "lrc-maker-preferences";
  }

  constructor() {
    try {
      const p = JSON.parse(localStorage.getItem(Preferences.storageName));
      this.trim = p.trim;
      this.fixed = p.fixed;
      this.space_between_tag_text = p.space_between_tag_text;
      this.use_browser_built_in_audio_player =
        p.use_browser_built_in_audio_player;
      this.use_space_button_on_screen = p.use_space_button_on_screen;
      this.night_mode = p.night_mode;
    } catch (e) {}
  }

  save() {
    try {
      localStorage.setItem(
        Preferences.storageName,
        JSON.stringify(toJS(this, false))
      );
    } catch (e) {}
  }

  @action.bound
  toggle_trim() {
    if (this.trim === true) {
      this.trim = false;
      this.space_between_tag_text = false;
    } else {
      this.trim = true;
    }
  }

  @action.bound
  toggle_space_between_tag_text() {
    if (this.space_between_tag_text === false) {
      this.space_between_tag_text = true;
      this.trim = true;
    } else {
      this.space_between_tag_text = false;
    }
  }

  @action.bound
  toggle_audio_player() {
    this.use_browser_built_in_audio_player = !this
      .use_browser_built_in_audio_player;
  }

  @action.bound
  toggle_space_button() {
    this.use_space_button_on_screen = !this.use_space_button_on_screen;
  }

  @action.bound
  toggle_night_mode() {
    this.night_mode = !this.night_mode;
  }

  @action.bound
  add_fixed() {
    if (this.fixed < 3) {
      this.fixed += 1;
    }
  }

  @action.bound
  minus_fixed() {
    if (this.fixed > 0) {
      this.fixed -= 1;
    }
  }
}

const preferences = new Preferences();
export { preferences };
