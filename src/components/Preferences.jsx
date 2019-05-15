/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "preact-mobx-observer";
import { languages } from "../languages/index.js";
import { preferences as pref } from "../store/preferences.js";

@observer
class Preferences extends Component {
    /** @type {(ev: JSX.EventHandler<Event>) => void} */
    handleLanguageSelect(ev) {
        /** @type {HTMLSelectElement} */
        const target = ev.target;
        pref.language = target.value;
    }

    clearCache = () => {
        localStorage.clear();
    };

    /** @type {(ev: JSX.EventHandler<Event>) => void} */
    onSpaceStartChange = (ev) => {
        /** @type {HTMLInputElement} */
        const target = ev.target;
        if (target.validity.valid) {
            pref.set_spaceStart(Number.parseInt(target.value, 10));
        } else {
            target.value = pref.spaceStart;
        }
    };

    /** @type {(ev: JSX.EventHandler<Event>) => void} */
    onSpaceEndChange = (ev) => {
        /** @type {HTMLInputElement} */
        const target = ev.target;
        if (target.validity.valid) {
            pref.set_spaceEnd(Number.parseInt(target.value, 10));
        } else {
            target.value = pref.spaceEnd;
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
                                    <option key={key} value={key} selected={pref.language === key}>
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
                        <div>{pref.i18n["preferences"]["update-time"]}</div>
                        <div>{BUILD_TIME}</div>
                    </div>
                </section>
                <section>
                    <div className="section-group">
                        <div>{pref.i18n["preferences"]["hash"]}</div>
                        <div>{BUILD_REVISION}</div>
                    </div>
                </section>
                <section>
                    <div className="section-group">
                        <div>{pref.i18n["preferences"]["github-repo"]}</div>
                        <a href="https://github.com/magic-akari/lrc-maker" target="_blank">
                            Github
                        </a>
                    </div>
                </section>
                <section>
                    <div className="section-group">
                        <div>{pref.i18n["preferences"]["help"]}</div>
                        <a href="https://github.com/magic-akari/lrc-maker/wiki" target="_blank">
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
                        <label htmlFor="space-start">{pref.i18n["preferences"]["left-space"]}</label>
                        <input
                            name="spaceStart"
                            id="space-start"
                            required={true}
                            min="-1"
                            type="number"
                            step="1"
                            value={pref.spaceStart}
                            onChange={this.onSpaceStartChange}
                        />
                    </label>
                </section>
                <section>
                    <label className="section-group">
                        <label htmlFor="space-end">{pref.i18n["preferences"]["right-space"]}</label>
                        <input
                            name="spaceEnd"
                            id="space-end"
                            required={true}
                            min="-1"
                            type="number"
                            step="1"
                            value={pref.spaceEnd}
                            onChange={this.onSpaceEndChange}
                        />
                    </label>
                </section>
                <section>
                    <label className="section-group">
                        <div>{pref.i18n["preferences"]["built-in-audio"]}</div>
                        <label class="label-switch">
                            <input type="checkbox" checked={pref.builtInAudio} onChange={pref.toggle_audio_player} />
                            <div class="checkbox" />
                        </label>
                    </label>
                </section>
                <section>
                    <label className="section-group">
                        <div>{pref.i18n["preferences"]["space-button-on-screen"]}</div>
                        <label class="label-switch">
                            <input type="checkbox" checked={pref.screenButton} onChange={pref.toggle_screen_button} />
                            <div class="checkbox" />
                        </label>
                    </label>
                </section>
                <section>
                    <label className="section-group">
                        <div>{pref.i18n["preferences"]["dark-mode"]}</div>
                        <label class="label-switch">
                            <input type="checkbox" checked={pref.darkMode} onChange={pref.toggle_dark_mode} />
                            <div class="checkbox" />
                        </label>
                    </label>
                </section>
                <section>
                    <div className="section-group">
                        <button onClick={this.clearCache}>{pref.i18n["preferences"]["clear-cache"]}</button>
                    </div>
                </section>
            </div>
        );
    }
}
export { Preferences };
