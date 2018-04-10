/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
import App from "./App.jsx";

const Root = () => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>LRC Maker</title>
      <meta
        name="description"
        content="LRC Maker｜The easiest way to create cool LRC files by yourself. 灯里的歌词滚动姬｜迄今为止最易用的歌词制作工具"
      />
      <meta
        name="keywords"
        content="lrc maker,lrc generate,歌词制作,歌词滚动"
      />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="renderer" content="webkit" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="stylesheet" href="./app.css" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="./favicons/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        href="./favicons/favicon-32x32.png"
        sizes="32x32"
      />
      <link
        rel="icon"
        type="image/png"
        href="./favicons/favicon-16x16.png"
        sizes="16x16"
      />
      <link rel="manifest" href="./site.webmanifest" />
      <link
        rel="mask-icon"
        href="./favicons/safari-pinned-tab.svg"
        color="#ff4081"
      />
      <link rel="shortcut icon" href="./favicons/favicon.ico" />
      <link rel="prefetch" href="./app.js" as="script" />
      <meta name="application-name" content="灯里的歌词滚动姬" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta
        name="msapplication-config"
        content="./favicons/browserconfig.xml"
      />
      <meta name="apple-mobile-web-app-title" content="灯里的歌词滚动姬" />
    </head>
    <body>
      {App({ loading: true })}
      <script
        dangerouslySetInnerHTML={{
          __html: `!(function(d,a){a = d.createElement("script");a.charset="utf-8";a.src=typeof Symbol=="function"?"./app.js":"./app.es5.js";d.body.appendChild(a)})(document)`
        }}
      />
    </body>
  </html>
);

export default Root;
