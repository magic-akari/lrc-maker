/**
 * Created by akari on 19/02/2017.
 */
import React, {Component} from "react";
import {Shortcuts} from "react-shortcuts";
import LRC from "../lrc";

const playOrPause = audio => {
    if (audio === undefined) {
        return;
    }
    if (audio.paused) {
        audio.play();
    }
    else {
        audio.pause();
    }
};

const playbackRateList = [0.25, 0.5, 0.66, 0.8, 1.0, 1.25, 1.5, 2.0, 4.0];


const Footer = ({audio, audioSrc, updateTime, setAudio, showTimestamp, playbackRate = 1, setPlaybackRate}) => {
    const speedup = () => {
        audio.playbackRate = playbackRateList.find(r => r > audio.playbackRate) || playbackRateList[playbackRateList.length - 1];
    };

    const speeddown = () => {
        audio.playbackRate = playbackRateList.filter(r => r < audio.playbackRate).reverse()[0] || playbackRateList[0];
    };

    const shortcutsHandler = (action, event) => {
        let textarea = document.querySelector('.app-textarea');
        if (audio === undefined) {
            return;
        }
        switch (action) {
            case 'PLAYORPAUSE':
                playOrPause(audio);
                break;
            case 'SEEKBACK':
                audio.currentTime -= 5;
                event.preventDefault();
                break;
            case 'SEEKNEXT':
                audio.currentTime += 5;
                event.preventDefault();
                break;
            case 'SPEEDUP':
                speedup();
                event.preventDefault();
                break;
            case 'SPEEDDOWN':
                speeddown();
                event.preventDefault();
                break;
            case 'SPEEDRESET':
                audio.playbackRate = 1.0;
                event.preventDefault();
                break;
        }
    };


    return (<footer id="app-footer" className="app-footer">
        <Shortcuts name='MEDIA'
                   targetNodeSelector="body"
                   handler={shortcutsHandler}>
            <div className="foot-bar">
                <p>播放倍速: {playbackRate}</p>
                {showTimestamp ? <p>当前时间：{LRC.timeToTag(audio && audio.currentTime)}</p> : null}
                <p>总时间 {LRC.timeToTag(audio && audio.duration)}</p>
            </div>
            <audio ref={audio => {
                setAudio(audio);
            }}
                   src={audioSrc} className="app-audio" controls="controls"
                   onTimeUpdate={() => updateTime()}
                   onRateChange={(e) => setPlaybackRate(audio.playbackRate)}

            />
        </Shortcuts>
    </footer >);
};


export default Footer;