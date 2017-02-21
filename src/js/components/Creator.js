/**
 * Created by akari on 19/02/2017.
 */
import React, {Component} from "react";
import LRC from "../lrc";
import {Shortcuts} from "react-shortcuts";

const Creator = (props) => {

    const {
        showTimestamp, elapsedTime, lyric, highlightIndex,showSyncButton,
        selectedIndex, onChangeSelectedIndex, onSyncLrcLRC, onOutput, onDeleteTimestamp
    }= props;

    const shortcutsHandler = (action, event) => {
        switch (action) {
            case 'UP':
                onChangeSelectedIndex(selectedIndex - 1);
                event.preventDefault();
                break;
            case 'DOWN':
                onChangeSelectedIndex(selectedIndex + 1);
                event.preventDefault();
                break;
            case 'SPACE':
                onSyncLrcLRC();
                event.preventDefault();
                break;
            case 'DELETE':
                onDeleteTimestamp();
                event.preventDefault();

        }
    };

    return (
        <Shortcuts id="app-creator" className="app-creator"
                   name='CREATOR'
                   targetNodeSelector="body"
                   handler={shortcutsHandler}>
            <div className="tool-bar">
                <button className="tool-bar-button outputButton" onClick={() => onOutput()}>导出</button>
                <button className={`sync-lyric ${showSyncButton?'is-visible':null}`} onClick={() => onSyncLrcLRC()}>
                    <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M10 8H8v4H4v2h4v4h2v-4h4v-2h-4zm4.5-1.92V7.9l2.5-.5V18h2V5z"/>
                    </svg>
                </button>
            </div>
            <ul className={`lyric-list ${showTimestamp ? 'showtimestamp' : null}`}>{
                lyric.map((lyricLine, index) => {
                        let className = ['lyric'];
                        let timeTag = lyricLine.time !== undefined ? LRC.timeToTag(lyricLine.time) : '';
                        if (index === selectedIndex) {
                            className.push('select');
                        }
                        if (index === highlightIndex) {
                            className.push('highlight');
                        }
                        let pre_index = Math.max(index - 1, 0);
                        let pre_time = lyric[pre_index].time;
                        if (pre_time && pre_time > lyricLine.time) {
                            className.push('error');
                        }
                        return <li key={lyricLine.key}
                                   className={className.join(' ')}
                                   onClick={() => onChangeSelectedIndex(index)}
                                   data-elapsedTime={showTimestamp && index === selectedIndex ? LRC.timeToTag(elapsedTime) : null}
                        >
                            <p>{showTimestamp ? timeTag : ''}{' '}{lyricLine.text}</p>
                        </li>;
                    }
                )
            }</ul>

        </Shortcuts>);
};


export default Creator;