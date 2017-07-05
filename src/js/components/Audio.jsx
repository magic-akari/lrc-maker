/**
 * Created by 阿卡琳 on 21/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observable, action, computed, autorun } from "mobx";
import { observer } from "../lib/observer.js";
import {
  PlaySvg,
  PauseSvg,
  VolumeSvg,
  MutedSvg,
  Replay5sSvg,
  Forward5sSvg
} from "./SVG.jsx";

const Slider = ({ min, max, step, value, onInput, className }) => {
  const total = max - min || 1;
  const percent = (value - min) / total;
  return (
    <div className={`slider ${className}-slider`}>
      <progress min={0} max={1} value={percent} />
      <input
        className={className}
        min={min}
        max={max}
        step={step}
        value={value}
        type="range"
        onInput={onInput}
        onChange={onInput}
      />
    </div>
  );
};

const myAddEventListener = (node, eventType, func) => {
  node.addEventListener(eventType, func);
  return () => node.removeEventListener(eventType, func);
};

@observer
class Audio extends Component {
  @observable duration = 0;
  /**
   * 内部使用的真实值
   * @type {number}
   * @private
   */
  @observable _currentTime = 0;
  @observable paused = true;
  @observable _volume = 1;
  @observable _playbackRate_exp = 0;
  @observable muted = false;
  handler;

  @computed
  get src() {
    return this.props.src;
  }

  set playbackRate_exp(value) {
    let _value = value;
    if (_value > 1) _value = 1;
    if (_value < -1) _value = -1;
    this._playbackRate_exp = _value;
  }

  @computed
  get playbackRate_exp() {
    return this._playbackRate_exp;
  }

  set volume(value) {
    this._volume = this.audio.volume = value;
  }

  @computed
  get volume() {
    return this._volume;
  }

  set currentTime(value) {
    this._currentTime = this.audio.currentTime = value;
  }

  @computed
  get currentTime() {
    if (this._currentTime < 0) return 0;
    if (this._currentTime > this.duration) return this.duration;
    return this._currentTime;
  }

  @computed
  get currentTime_int() {
    return ~~this.currentTime;
  }

  /**
   * 将 -1~1 的滑动条值转为 0.37~2.71的播放倍速
   * @returns {number}
   */
  @computed
  get playbackRate() {
    return Math.exp(this._playbackRate_exp);
  }

  static defaultProps = {
    className: "",
    onLoadedMetadata: () => {},
    onTimeUpdate: () => {}
  };

  constructor(props) {
    super(props);
    // this.src = props.src;

    try {
      this.audio = new window.Audio(this.props.src);
    } catch (e) {}
  }

  //noinspection JSUnresolvedVariable
  @action componentWillReceiveProps = props => (this.audio.src = props.src);

  componentDidMount() {
    const { onLoadedMetadata, onTimeUpdate } = this.props;

    //noinspection JSUnresolvedVariable
    this.disposers = [
      // audio 通知改变内部状态
      myAddEventListener(
        this.audio,
        "loadedmetadata",
        action(e => {
          this.duration = this.audio.duration;
          this.paused = this.audio.paused;
          this.onloadedmetadata && this.onloadedmetadata();
          onLoadedMetadata(e);
        })
      ),
      myAddEventListener(
        this.audio,
        "timeupdate",
        action(e => {
          onTimeUpdate(e);
        })
      ),
      myAddEventListener(
        this.audio,
        "ended",
        action(e => {
          this.paused = true;
          cancelAnimationFrame(this.handler);
        })
      ),

      // 内部状态控制 audio 状态
      autorun(() => (this.audio.playbackRate = this.playbackRate)),
      autorun(() => (this.audio.volume = this.volume)),
      autorun(() => (this.audio.muted = this.muted))
    ];
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.handler);
    this.disposers.forEach(f => f());
    this.audio.pause();
    this.paused = true;
    delete this.audio;
  }

  @action.bound
  play() {
    this.audio.play();
    this.paused = false;
    this.handler = requestAnimationFrame(this.syncTime);
  }

  @action.bound
  pause() {
    this.audio.pause();
    this.paused = true;
    cancelAnimationFrame(this.handler);
  }

  @action.bound
  syncTime() {
    this._currentTime = this.audio.currentTime;
    this.audio.dispatchEvent(new CustomEvent("timeupdate"));
    if (!this.paused) this.handler = requestAnimationFrame(this.syncTime);
  }

  togglePlayPause = () => {
    this.paused ? this.play() : this.pause();
  };

  @action
  handlePlaybackRateChange = e => (this.playbackRate_exp = e.target.value);

  @action handlePlaybackRateReset = () => (this.playbackRate_exp = 0);

  @action.bound
  handleVolumeChange(e) {
    this.muted = false;
    this.volume = e.target.value;
  }

  @action handleTimeSelect = e => (this.currentTime = e.target.value);

  @action replay5s = () => (this.currentTime -= 5);
  @action forward5s = () => (this.currentTime += 5);

  @action toggleMuted = () => (this.muted = !this.muted);

  static timeToTag(time) {
    let m = ~~(time / 60);
    m = ("" + m).padStart(2, "0");
    let s = ~~(time % 60);
    s = ("" + s).padStart(2, "0");
    return `${m}:${s}`;
  }

  @computed
  get timeTag() {
    return (
      <span>
        {Audio.timeToTag(this.currentTime_int)}
        {this.duration === 0 ? null : " / " + Audio.timeToTag(this.duration)}
      </span>
    );
  }

  render() {
    return (
      <div className={this.props.className}>
        <section
          className={"time-line-section" + (this.paused ? "" : " playing")}
        >
          <button
            tabIndex="-1"
            className="replay5s"
            onClick={this.replay5s}
            disabled={this.currentTime_int <= 0}
          >
            {Replay5sSvg()}
          </button>
          <button
            tabIndex="-1"
            disabled={!this.duration}
            onClick={this.togglePlayPause}
          >
            {this.paused ? PlaySvg() : PauseSvg()}
          </button>
          <button
            tabIndex="-1"
            className="forward5s"
            onClick={this.forward5s}
            disabled={this.currentTime_int >= this.duration}
          >
            {Forward5sSvg()}
          </button>
          {this.timeTag}
          {Slider({
            min: 0,
            max: this.duration,
            step: "1",
            value: this.currentTime_int,
            onInput: this.handleTimeSelect,
            className: "time-line"
          })}
        </section>
        <section className="audio-extra-section">
          <button tabIndex="-1" onClick={this.handlePlaybackRateReset}>
            X{this.playbackRate.toFixed(2)}
          </button>
          {Slider({
            className: "playbackrate",
            min: -1,
            max: 1,
            step: "any",
            value: this.playbackRate_exp,
            onInput: this.handlePlaybackRateChange
          })}
          <button tabIndex="-1" onClick={this.toggleMuted}>
            {this.muted || this.volume == 0 ? MutedSvg() : VolumeSvg()}
          </button>
          {Slider({
            min: 0,
            max: 1,
            step: "any",
            value: this.muted ? 0 : this.volume,
            onInput: this.handleVolumeChange,
            className: "volume-slider"
          })}
        </section>
      </div>
    );
  }
}

export { Audio };
