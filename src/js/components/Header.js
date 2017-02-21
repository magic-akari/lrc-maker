/**
 * Created by akari on 19/02/2017.
 */
import React, {Component} from "react";

const Header = ({showSlide}) => <header id="app-header" className="app-header">
    <div className="wrapper">
        <div className="app-header-box">
            <span id="app-title" className="app-title">歌词滚动姬</span>
            <button className="app-menu-button" onClick={() => showSlide()}>
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
            </button>
        </div>
    </div>
</header>;

export default Header;