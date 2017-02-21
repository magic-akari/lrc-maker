/**
 * Created by akari on 19/02/2017.
 */
import React, {Component} from "react";
import LRC from "../lrc";
import {Shortcuts} from "react-shortcuts";

const Creator = (props) => {

    const {
        showTimestamp, onChangeShowTimestamp, elapsedTime, lyric, highlightIndex,
        selectedIndex, onChangeSelectedIndex, onSyncLrcLRC, onOutput, onDeleteTimestamp,
        checkMode, onChangeCheckMode
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
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <label htmlFor="showTimeTag">显示时间轴</label>
                    <label className="label-switch">
                        <input type="checkbox" id="showTimeTag" checked={showTimestamp}
                               onChange={e => onChangeShowTimestamp(e.target.checked)}/>
                        <div className="checkbox"/>
                    </label>
                </div>
                <button className="tool-bar-button outputButton" onClick={() => onOutput()}>导出</button>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <label htmlFor="checkMode">校对模式</label>
                    <label className="label-switch">
                        <input type="checkbox" id="checkMode" checked={checkMode}
                               onChange={e => onChangeCheckMode(e.target.checked)}/>
                        <div className="checkbox"/>
                    </label>
                </div>
            </div>
            <ul className="lyric-list" style={showTimestamp ? {textAlign: 'left'} : null}>{
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