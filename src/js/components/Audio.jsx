/**
 * Created by 阿卡琳 on 21/06/2017.
 */
"use strict";
import { Component } from "preact";
import { observable, action, computed, autorun } from "mobx";
import { observer } from "preact-mobx-observer";
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
  @observable volume = 1;
  @observable _playbackRate = 1;
  @observable muted = false;
  handler;

  componentDidMount() {
    this.audio.volume =
      parseFloat(sessionStorage.getItem("lrc-maker-volume")) || 1;
    this.playbackRate =
      parseFloat(sessionStorage.getItem("lrc-maker-playbackRate")) || 1;
    this.audio.muted = sessionStorage.getItem("lrc-maker-muted") == "true";

    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("lrc-maker-volume", this.volume);
      sessionStorage.setItem("lrc-maker-playbackRate", this._playbackRate);
      sessionStorage.setItem("lrc-maker-muted", this.muted);
    });
  }

  // HACK: trigger this.audio.onTimeUpdate
  set currentTime(value) {
    this.audio.currentTime = value;
  }

  get currentTime() {
    return this._currentTime;
  }

  set playbackRate(value) {
    this.audio.playbackRate = value;
  }

  get playbackRate() {
    return this._playbackRate;
  }

  set playbackRate_exp(value) {
    this.playbackRate = Math.exp(value);
  }

  @computed
  get playbackRate_exp() {
    return Math.log(this.playbackRate);
  }

  @computed
  get currentTime_int() {
    return ~~this.currentTime;
  }

  @action.bound
  syncTime() {
    this._currentTime = this.audio.currentTime;

    // HACK: trigger the onTimeUpdate
    this.props.onTimeUpdate({ target: this });

    if (!this.paused) this.handler = requestAnimationFrame(this.syncTime);
  }

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

  @action
  onLoadedMetadata = e => {
    this.duration = e.target.duration;
    this.paused = e.target.paused;
  };

  @action
  onPlay = e => {
    this.paused = e.target.paused;
    this.syncTime();
  };

  @action
  onPause = e => {
    this.paused = e.target.paused;
    cancelAnimationFrame(this.handler);
  };

  @action
  onVolumeChange = e => {
    this.volume = e.target.volume;
    this.muted = e.target.muted;
  };

  onTimeUpdate = e => {
    if (this.paused) {
      this.syncTime();
    }
  };

  @action
  onRateChange = e => {
    this._playbackRate = e.target.playbackRate;
  };

  replay5s = () => {
    this.audio.currentTime -= 5;
  };

  forward5s = () => {
    this.audio.currentTime += 5;
  };

  play = () => {
    this.audio.play();
  };

  pause = () => {
    this.audio.pause();
  };

  togglePlayPause = () => {
    this.paused ? this.play() : this.pause();
  };

  handleTimeSelect = e => {
    this.audio.currentTime = e.target.value;
  };

  handlePlaybackRateChange = e => {
    this.audio.playbackRate = Math.exp(e.target.value);
  };

  handlePlaybackRateReset = e => {
    this.audio.playbackRate = 1;
  };

  handleVolumeChange = e => {
    const volume = e.target.value;
    this.audio.muted = volume === 0;
    this.audio.volume = volume;
  };

  toggleMuted = e => {
    this.audio.muted = !this.audio.muted;
  };

  get timelineSection() {
    if (this.props.controls) {
      return null;
    }
    return (
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
    );
  }

  get audioextraSection() {
    if (this.props.controls) {
      return null;
    }
    return (
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
    );
  }

  render() {
    return (
      <div className={this.props.className}>
        <audio
          controls={this.props.controls}
          src={this.props.src}
          ref={audio => (this.audio = audio)}
          onLoadedMetadata={this.onLoadedMetadata}
          onPlay={this.onPlay}
          onPause={this.onPause}
          onEnded={this.onPause}
          onTimeUpdate={this.onTimeUpdate}
          onVolumeChange={this.onVolumeChange}
          onRateChange={this.onRateChange}
        />
        {this.timelineSection}
        {this.audioextraSection}
      </div>
    );
  }
}

export { Audio };
