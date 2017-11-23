/**
 * Created by 阿卡琳 on 22/11/2017.
 */
"use strict";

let languages;

if (__SSR__) {
  languages = { "en-US": require("./en-US.json") };
} else {
  languages = (ctx =>
    ctx.keys().reduce((result, key) => {
      // key == "./en-US.json"
      result[key.slice(2, -5)] = ctx(key);
      return result;
    }, {}))(require.context(".", false, /.json$/));
}

export default languages;
