/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
import App from "./App.jsx";

const Root = () =>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>灯里的歌词滚动姬</title>
      <meta name="description" content="灯里的歌词滚动姬｜迄今为止最易用的歌词制作工具" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="renderer" content="webkit" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="stylesheet" href="./dist/app.css" />
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
      <link rel="manifest" href="./manifest.json" />
      <link
        rel="mask-icon"
        href="./favicons/safari-pinned-tab.svg"
        color="#282828"
      />
      <link rel="shortcut icon" href="./favicons/favicon.ico" />
      <meta name="application-name" content="灯里的歌词滚动姬" />
      <meta name="theme-color" content="#282828" />
      <meta
        name="msapplication-config"
        content="./favicons/browserconfig.xml"
      />
      <meta name="apple-mobile-web-app-title" content="灯里的歌词滚动姬" />
    </head>
    <body>
      {App()}
      {process.env.NODE_ENV === "production"
        ? `{% include info.html app_version='${process.env
            .npm_package_version}' %}`
        : null}
      <script src="./dist/app.js" />
      {process.env.NODE_ENV === "production"
        ? `{% include fallback.html %}{% include google-analytics.html %}`
        : null}
    </body>
  </html>;

export default Root;
