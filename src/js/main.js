/**
 * Created by akari on 19/02/2017.
 */
import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import "normalize.css";
import "../css/app.css";

render(<App />, document.getElementById("react-root"));

// test csspositionsticky
let aStyle = document.createElement("a").style;
aStyle.cssText = "position:sticky;position:-webkit-sticky;";
if (aStyle.position.indexOf("sticky") === -1) {
  document.documentElement.className = "no-csspositionsticky";
}

console.log(
  "%c",
  "padding:50px;line-height:100px;background:url('https://cloud.githubusercontent.com/assets/7829098/25065994/9d4855ea-224c-11e7-930e-7d82f5597e5e.png') no-repeat;"
);

console.log(
  "欢迎在云音乐关注我，为阿卡琳增加一点存在感 Ki⭐️ra http://music.163.com/user/home?id=45441555"
);

console.log("欢迎反馈 star: https://github.com/hufan-Akari/LRC-MAKER");

console.log("欢迎反馈 BUG: https://github.com/hufan-Akari/LRC-MAKER/issues/new");

console.log("欢迎 fork: https://github.com/hufan-Akari/LRC-MAKER/fork");

console.log(
  "欢迎发送 pull request: https://github.com/hufan-Akari/LRC-MAKER/pull/new/master"
);
