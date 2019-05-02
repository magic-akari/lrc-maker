#!/usr/bin/env node

/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
const render = require("preact-render-to-string");

global.__SSR__ = true;

require("@babel/register")({
    plugins: [
        ["@babel/plugin-transform-react-jsx", { pragma: 'require("preact").h' }],
        ["@babel/plugin-transform-modules-commonjs"],
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        ["@babel/plugin-proposal-class-properties", { loose: true }]
    ]
});

const { Root } = require("../src/components/Root.jsx");
const html = "<!DOCTYPE html>" + render(Root());

process.stdout.write(html);
