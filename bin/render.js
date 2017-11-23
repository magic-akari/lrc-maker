#!/usr/bin/env node

/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
const path = require("path");
const render = require("preact-render-to-string");
const { h, Component } = require("preact");

global.h = h;
global.Component = Component;
global.__SSR__ = true;

require("babel-register")({
  plugins: [
    [
      "transform-react-jsx",
      {
        pragma: "h"
      }
    ],
    "transform-es2015-modules-commonjs",
    "transform-decorators-legacy",
    "transform-class-properties"
  ]
});

const Root = require("../src/js/components/Root.jsx").default;
const html = "<!DOCTYPE html>" + render(Root());

process.stdout.write(html);
