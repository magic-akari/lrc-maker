/**
 * Created by akari on 19/02/2017.
 */
import React, { Component } from "react";
import LRC from "../lrc";

const Footer = (
  {
    audio,
    audioSrc,
    updateTime,
    setAudio,
    showTimestamp,
    playbackRate = 1,
    setPlaybackRate,
    textareaFocused,
    checkMode = false
  }
) => {
  return (
    <footer id="app-footer" className="app-footer">
      <div className="foot-bar">
        <p>播放倍速: {playbackRate}</p>
        {showTimestamp
          ? <p>当前时间：{LRC.timeToTag(audio && audio.currentTime)}</p>
          : null}
        <p>总时间 {LRC.timeToTag(audio && audio.duration)}</p>
        <p>页面滚动模式：{checkMode ? "校对" : "打轴"}</p>
      </div>
      <audio
        ref={audio => {
          setAudio(audio);
        }}
        src={audioSrc}
        className="app-audio"
        controls="controls"
        onTimeUpdate={() => updateTime()}
        onRateChange={e => setPlaybackRate(audio.playbackRate)}
      />
    </footer>
  );
};

export default Footer;
