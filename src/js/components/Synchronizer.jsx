/**
 * Created by 阿卡琳 on 15/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observable, action, computed, autorun } from "mobx";
import { observer } from "preact-mobx-observer";
import { lrc, LRC } from "../store/lrc.js";
import { appState } from "../store/appState.js";
import { preferences } from "../store/preferences.js";
import { DownLoadButton } from "./DownLoadButton.jsx";
import { LockNodeButton } from "./LockNodeButton.jsx";

@observer
class CurrentTimeTag extends Component {
  render() {
    return (
      <span
        className="current-time-tag"
        data-time={LRC.timeToTag(appState.currentTime_fixed) + "-> "}
      />
    );
  }
}

@observer
class SynchronizerList extends Component {
  @observable.ref _lockNode;

  @computed
  get scroll_distance() {
    if (this.lockNode === undefined) {
      return 0;
    }
    let distance =
      -document.documentElement.clientHeight / 2 +
      this.lockNode.offsetTop +
      this.lockNode.offsetHeight;
    return distance < 0 ? 0 : distance;
  }

  @computed
  get scroll_style() {
    if (appState.lock && this.lockNode)
      return {
        transform: `translate3D(0,${-~~this.scroll_distance}px,0)`
      };
    return null;
  }

  @computed
  get lockNode() {
    return this._lockNode;
  }
  
  set lockNode(value) {
    if (value) {
      this._lockNode = value;
    }
  }
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.disposer = autorun(() => {
      if (!appState.lock) {
        window.scroll({
          left: 0,
          top: this.scroll_distance,
          behavior: "smooth"
        });
      }
    });

    Mousetrap.bind("space", e => {
      sync();
      e.preventDefault();
      return false;
    });
    Mousetrap.bind(["up", "w", "j"], e => {
      this.changeSelect(-1);
      e.preventDefault();
      return false;
    });

    Mousetrap.bind(["down", "s", "k"], e => {
      this.changeSelect(1);
      e.preventDefault();
      return false;
    });
    Mousetrap.bind("home", e => {
      this.changeSelect(-1e3);
      e.preventDefault();
      return false;
    });

    Mousetrap.bind("end", e => {
      this.changeSelect(1e3);
      e.preventDefault();
      return false;
    });
    Mousetrap.bind("pageup", e => {
      this.changeSelect(-10);
      e.preventDefault();
      return false;
    });

    Mousetrap.bind("pagedown", e => {
      this.changeSelect(10);
      e.preventDefault();
      return false;
    });
    Mousetrap.bind(["command+backspace", "del"], e => {
      this.deleteTimestamp();
      e.preventDefault();
      return false;
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind([
      "space",
      "up",
      "w",
      "j",
      "down",
      "s",
      "k",
      "home",
      "end",
      "pageup",
      "pagedown",
      "command+backspace",
      "del"
    ]);
    this.disposer();
  }

  @action
  deleteTimestamp() {
    let selectedIndex = lrc.selectedIndex;
    lrc.lyric[selectedIndex].time = undefined;
  }

  @action
  changeSelect(dl) {
    lrc.selectedIndex += dl;
  }

  @action.bound
  selectLine(e) {
    let { key } = e.target.dataset;
    if (key) {
      lrc.selectedIndex = Number(key);
    } else return true;
  }

  render() {
    return (
      <ul
        className={"lyric-list"}
        onClick={this.selectLine}
        style={this.scroll_style}
      >
        {lrc.lyric.map((lyricLine, index) => {
          const className = ["lyric-line"];
          /**
           * lyricLine.key === index == data-key
           */
          if (lyricLine.key === lrc.highlightIndex) {
            className.push("highlight");
          }
          if (lyricLine.key === lrc.selectedIndex) {
            className.push("select");
          }
          let pre_key = Math.max(lyricLine.key - 1, 0);
          let pre_time = lrc.lyric[pre_key].time;
          if (pre_time && pre_time > lyricLine.time) {
            className.push("error");
          }

          const time = lyricLine.time;

          const lyricTimeTag =
            time === undefined ? null : (
              <span className="lyric-time">
                {LRC.timeToTag(lyricLine.time)}
              </span>
            );

          return (
            <li
              className={className.join(" ")}
              data-key={lyricLine.key}
              key={lyricLine.key}
              ref={node => {
                if (appState.lock && lyricLine.key === lrc.highlightIndex) {
                  action(() => {
                    this.lockNode = node;
                  })();
                } else if (
                  !appState.lock &&
                  lyricLine.key === lrc.selectedIndex
                ) {
                  action(() => {
                    this.lockNode = node;
                  })();
                }
              }}
            >
              {lyricLine.key == lrc.selectedIndex ? <CurrentTimeTag /> : null}
              <p className="lyric">
                {lyricTimeTag}
                {preferences.space_between_tag_text ? " " : null}
                <span class="lyric-text">{lyricLine.text}</span>
              </p>
            </li>
          );
        })}
      </ul>
    );
  }
}

const sync = action(() => {
  if (lrc.lyric.length > 0) {
    let selectedIndex = lrc.selectedIndex;
    lrc.lyric[selectedIndex].time = appState.currentTime;
    lrc.selectedIndex += 1;
  }
});

const Synchronizer = () => (
  <div className="synchronizer">
    <SynchronizerList />
    <div className="extra_button_group">
      <LockNodeButton />
      <DownLoadButton />
    </div>
  </div>
);

export { Synchronizer, sync };
