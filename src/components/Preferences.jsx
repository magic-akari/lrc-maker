/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { preferences as pref } from "../store/preferences.js";
import languages from "languages/index.js";

@observer
class Preferences extends Component {
  handleLanguageSelect(e) {
    pref.language = e.target.value;
  }

  clearCache = () => {
    localStorage.clear();
    if ("serviceWorkerRegistration" in window) {
      window.serviceWorkerRegistration.unregister();
    }
  };

  render() {
    return (
      <div className="preferences">
        <section>
          <div className="section-group">
            <div>{pref.i18n["preferences"]["language"]}</div>
            <div className="lang-select">
              <select onChange={this.handleLanguageSelect}>
                {Object.entries(languages).map(([key, value]) => (
                  <option
                    key={key}
                    value={key}
                    selected={pref.language === key}
                  >
                    {value["language-name"]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>{pref.i18n["preferences"]["version"]}</div>
            <div>{VERSION}</div>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>{pref.i18n["preferences"]["build-time"]}</div>
            <div>{BUILD_TIME}</div>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>{pref.i18n["preferences"]["build-revision"]}</div>
            <div>{BUILD_REVISION}</div>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>{pref.i18n["preferences"]["github-repo"]}</div>
            <a href="https://git.io/lrc-maker" target="_blank">
              Github
            </a>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>{pref.i18n["preferences"]["help"]}</div>
            <a
              href="https://github.com/hufan-akari/lrc-maker/wiki"
              target="_blank"
            >
              Github Wiki
            </a>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>{pref.i18n["preferences"]["time-tag-decimals"]}</div>
            <div class="stepper">
              <button class="addOnLeft" onClick={pref.minus_fixed}>
                -
              </button>
              <input type="text" value={pref.fixed} />
              <button class="addOnRight" onClick={pref.add_fixed}>
                +
              </button>
            </div>
          </div>
        </section>
        <section>
          <label className="section-group">
            <div>{pref.i18n["preferences"]["trim-line"]}</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={pref.trim}
                onChange={pref.toggle_trim}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>{pref.i18n["preferences"]["add-space"]}</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={pref.pretty_tag}
                onChange={pref.toggle_pretty_tag}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>{pref.i18n["preferences"]["built-in-audio"]}</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={pref.built_in_audio}
                onChange={pref.toggle_audio_player}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>{pref.i18n["preferences"]["space-button-on-screen"]}</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={pref.screen_button}
                onChange={pref.toggle_screen_button}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>{pref.i18n["preferences"]["dark-mode"]}</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={pref.dark_mode}
                onChange={pref.toggle_dark_mode}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <div className="section-group">
            <button onClick={this.clearCache}>
              {pref.i18n["preferences"]["clear-cache"]}
            </button>
          </div>
        </section>
      </div>
    );
  }
}
export { Preferences };
