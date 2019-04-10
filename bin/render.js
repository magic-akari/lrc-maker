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

require("@babel/register")({
    plugins: [
        ["@babel/plugin-transform-react-jsx", { pragma: "h" }],
        ["@babel/plugin-transform-modules-commonjs"],
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        ["@babel/plugin-proposal-class-properties", { loose: true }]
    ]
});

const { Root } = require("../src/components/Root.jsx");
const html = "<!DOCTYPE html>" + render(Root());

process.stdout.write(html);
