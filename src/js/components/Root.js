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
        <title>歌词滚动姬</title>
        <meta charSet="utf-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href="dist/app.css"/>
    </head>
    <body className="app-body">
    <div id="react-root" className="react-root" dangerouslySetInnerHTML={{__html: renderToString(<App/>)}}></div>
    <script src="dist/app.js" charSet="utf-8" onError="alert('加载失败，请刷新页面来重新捕获滚动姬。')"></script>
    </body>
    </html>
);


export default Root;