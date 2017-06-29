/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observer } from "../lib/observer.js";
import { preferences } from "../store/preferences.js";

@observer
class Preferences extends Component {
  constructor(props) {
    super(props);

    try {
      document.addEventListener(
        "visibilitychange",
        () => {
          if (document.hidden) {
            preferences.save();
          }
        },
        false
      );

      window.addEventListener("beforeunload", () => {
        preferences.save();
      });
    } catch (e) {}
  }

  componentWillUnmount() {
    preferences.save();
  }

  render() {
    return (
      <div className="preferences">
        <section>
          <div className="section-group">
            <div>app 版本</div>
            <div>
              {window.app_version}
            </div>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>app 更新时间</div>
            <div>
              {window.update_time}
            </div>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>build revision</div>
            <div>
              {window.build_revision}
            </div>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>项目开源地址</div>
            <a href="https://git.io/lrc-maker" target="_blank">
              Github
            </a>
          </div>
        </section>
        <section>
          <div className="section-group">
            <div>关于/帮助</div>
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
            <div>时间标签小数点位数</div>
            <div class="stepper">
              <button class="addOnLeft" onClick={preferences.minus_fixed}>
                -
              </button>
              <input type="text" value={preferences.fixed} />
              <button class="addOnRight" onClick={preferences.add_fixed}>
                +
              </button>
            </div>
          </div>
        </section>
        <section>
          <label className="section-group">
            <div>移除歌词两端空白</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={preferences.trim}
                onChange={preferences.toggle_trim}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>时间标签与歌词之间插入空格</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={preferences.space_between_tag_text}
                onChange={preferences.toggle_space_between_tag_text}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>使用浏览器内置音频播放器</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={preferences.use_browser_built_in_audio_player}
                onChange={preferences.toggle_audio_player}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>启用虚拟空格键</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={preferences.use_space_button_on_screen}
                onChange={preferences.toggle_space_button}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <label className="section-group">
            <div>夜间模式</div>
            <label class="label-switch">
              <input
                type="checkbox"
                checked={preferences.night_mode}
                onChange={preferences.toggle_night_mode}
              />
              <div class="checkbox" />
            </label>
          </label>
        </section>
        <section>
          <div className="section-group">
            <button onClick={() => localStorage.clear()}>重置app缓存</button>
          </div>
        </section>
      </div>
    );
  }
}
export { Preferences };
