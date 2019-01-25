# [LRC Maker](https://lrc-maker.github.io) &middot; [![Build Status](https://travis-ci.org/magic-akari/lrc-maker.svg?branch=master)](https://travis-ci.org/magic-akari/lrc-maker)

## What is this

This repository is a tool which help you create your lrc file.

## why lrc-maker

It's hard to find a user-friendly and cross-platform tool to create lrc. So I made one myself.

## How to use

open [lrc-maker](https://lrc-maker.github.io) to start. You can add the link to browser bookmark. It is easy to use.  
Darg and drop the file in the page to load audio file.  
Use arrow key and space key to insert the timestamp.

## Hot keys

|                                key                                |         function         |
| :---------------------------------------------------------------: | :----------------------: |
|                         <kbd>space</kbd>                          |  insert time stamp tag   |
|        <kbd>delete</kbd> / <kbd>⌘</kbd>+<kbd>delete</kbd>         |  remove time stamp tag   |
| <kbd>ctrl</kbd>+<kbd>enter</kbd> / <kbd>⌘</kbd>+<kbd>return</kbd> |       play / pause       |
|                    <kbd>←</kbd> / <kbd>a</kbd>                    | step backward 5 seconds  |
|                    <kbd>→</kbd> / <kbd>d</kbd>                    |  step forward 5 seconds  |
|            <kbd>↑</kbd> / <kbd>w</kbd> / <kbd>j</kbd>             |   select previous line   |
|            <kbd>↓</kbd> / <kbd>s</kbd> / <kbd>k</kbd>             |     select next line     |
|     <kbd>ctrl</kbd>+<kbd>↑</kbd> / <kbd>⌘</kbd>+<kbd>↑</kbd>      |  speed up playback rate  |
|     <kbd>ctrl</kbd>+<kbd>↓</kbd> / <kbd>⌘</kbd>+<kbd>↓</kbd>      | speed down playback rate |
|                           <kbd>r</kbd>                            |   reset playback rate    |

## Compatibility

Most modern browser is supported. The current version uses a lot of modern browser APIs to improve performance and improve the user experience. This project uses the ES Module to load the script code, which means that the browser version should meet the following requirements.

| browser | version |
| :------ | :------ |
| Firefox | >= 60   |
| Chrome  | >= 61   |
| Safari  | >= 11   |
| ios_saf | >= 11   |

The current version of Edge should be supported theoretically, but there are unexplained reasons for the code to not run after loading. This problem is left to be observed after the Edge with the V8 kernel is released.

The browsers which do not have ES Module support will load the fallback script. Note: The fallback is not tested.

Ancient browsers such as IE are no longer supported. If you are ancient browser user, it is better to use old version of this project.

## Development

If you want to run this project on your computer locally, follow the tips.

```bash
# clone this repo
git clone https://github.com/magic-akari/lrc-maker.git

cd lrc-make

# install dependencies
yarn # or use `npm i` instead of yarn

# build
yarn build # or `npm run build`

# or build with watch mode
yarn start # or `npm start`

```

This project does not configured a local server, and a plugin for vscode is used in actual development.

---

## 这个项目是什么

这是一个滚动歌词制作工具，滚动歌词是指带有时间标签的文本。

## 为什么会有这个项目

作者对于目前已有的工具不满意，无法跨平台使用，所以自己制作了一个。

## 如何使用

打开[歌词滚动姬](https://lrc-maker.github.io)，即可开始，你可以把这个链接收藏到浏览器书签。

## 热键

|                               按键                                |     功能     |
| :---------------------------------------------------------------: | :----------: |
|                         <kbd>space</kbd>                          | 插入时间标签 |
|        <kbd>delete</kbd> / <kbd>⌘</kbd>+<kbd>delete</kbd>         | 移除时间标签 |
| <kbd>ctrl</kbd>+<kbd>enter</kbd> / <kbd>⌘</kbd>+<kbd>return</kbd> |  播放/暂停   |
|                    <kbd>←</kbd> / <kbd>a</kbd>                    |  回退 5 秒   |
|                    <kbd>→</kbd> / <kbd>d</kbd>                    |  前进 5 秒   |
|            <kbd>↑</kbd> / <kbd>w</kbd> / <kbd>j</kbd>             |  选择上一行  |
|            <kbd>↓</kbd> / <kbd>s</kbd> / <kbd>k</kbd>             |  现在下一行  |
|     <kbd>ctrl</kbd>+<kbd>↑</kbd> / <kbd>⌘</kbd>+<kbd>↑</kbd>      | 提高播放速度 |
|     <kbd>ctrl</kbd>+<kbd>↓</kbd> / <kbd>⌘</kbd>+<kbd>↓</kbd>      | 降低播放速度 |
|                           <kbd>r</kbd>                            | 重置播放速度 |

## 兼容性

本项目的目标是兼容大部分现代浏览器，当前版本使用了很多的现代浏览器 API 来提升效能，改善用户体验。
本项目使用了 ES Module 来加载代码，这意味着浏览器的版本应该满足下列要求。

| 浏览器  | 版本  |
| :------ | :---- |
| Firefox | >= 60 |
| Chrome  | >= 61 |
| Safari  | >= 11 |
| ios_saf | >= 11 |

当前版本的 Edge 理论上应该支持，但是目前有不明原因导致代码加载后没有运行，这个问题留到 V8 内核的 Edge 发布后再做观察。

对于没有 ES Module 支持的浏览器，仍然做了回退处理以便正常使用。注意：此部分没有进行测试。

IE 等旧浏览器不再支持。对于这类浏览器使用者，可以使用本项目的旧版本。

## 本地开发

如果你想在本地计算机上运行这个项目，可以遵循下面操作。

```bash
# 克隆这个仓库
git clone https://github.com/magic-akari/lrc-maker.git

cd lrc-make

# 安装依赖
yarn # 或者使用 `npm i` 来代替 yarn

# 构建
yarn build # 或者 `npm run build`

# 开发模式构建
yarn start # 或者 `npm start`

```

本项目没有配置本地服务器，实际开发中使用了 vs code 的插件。
