/**
 * Created by akari on 21/02/2017.
 */
import React from "react";
import {renderToString} from "react-dom/server";
import App from "./App";

const Root = () => (
    <html>
    <head>
        <meta charSet="utf-8"/>
        <title>灯里的歌词滚动姬</title>
        <meta name="description" content="灯里的歌词滚动姬｜迄今为止最易用的歌词制作工具"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href="./dist/app.css"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32"/>
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16"/>
        <link rel="manifest" href="./manifest.json"/>
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#FF69B4"/>
        <meta name="apple-mobile-web-app-title" content="灯里的歌词滚动姬"/>
        <meta name="application-name" content="灯里的歌词滚动姬"/>
        <meta name="theme-color" content="#FF69B4"/>
        <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
        <link rel="preload" href="//cdn.bootcss.com/react/15.5.4/react.min.js"/>
        <link rel="preload" href="//cdn.bootcss.com/react/15.5.4/react-dom.min.js"/>
        <link rel="prefetch" href="//cdn.bootcss.com/react/15.5.4/react.min.js"/>
        <link rel="prefetch" href="//cdn.bootcss.com/react/15.5.4/react-dom.min.js"/>
        <link rel="prefetch" href="./dist/React.js"/>
        <link rel="prefetch" href="./dist/ReactDOM.js"/>
    </head>
    <body className="app-body">
    <div id="react-root" className="react-root" dangerouslySetInnerHTML={{__html: renderToString(<App/>)}}></div>
    <script dangerouslySetInnerHTML={{__html: `('FileReader' in window)||alert('不支持的浏览器版本');('Symbol' in window)||document.write('<script src="//cdn.bootcss.com/babel-polyfill/6.23.0/polyfill.min.js"><\\/script>')`}}></script>
    <script src="//cdn.bootcss.com/react/15.5.4/react.min.js"></script>
    <script dangerouslySetInnerHTML={{__html:`window.React||document.write('<script src="./dist/React.js"><\\/script>')`}}></script>
    <script src="//cdn.bootcss.com/react/15.5.4/react-dom.min.js"></script>
    <script dangerouslySetInnerHTML={{__html:`window.ReactDOM||document.write('<script src="./dist/ReactDOM.js"><\\/script>')`}}></script>
    <script src="./dist/app.js" charSet="utf-8"></script>
    </body>
    </html>
);


export default Root;
