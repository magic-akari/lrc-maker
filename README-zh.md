<p align="center">
    <a href="https://lrc-maker.github.io">
        <img src="./public/favicons/apple-touch-icon.png" alt="logo" />
    </a>
</p>

<div align="center">

[English](./README.md) · [中文](./README-zh.md)

</div>

# [歌词滚动姬][lrc maker] &middot; [![Build](https://github.com/magic-akari/lrc-maker/actions/workflows/build.yml/badge.svg)](https://github.com/magic-akari/lrc-maker/actions/workflows/build.yml)

## 这个项目是什么

这是一个滚动歌词制作工具，滚动歌词是指带有时间标签的文本。

## 为什么会有这个项目

作者对于目前已有的工具不满意，无法跨平台使用，所以自己制作了一个。

## 如何使用

打开[歌词滚动姬][lrc maker]即可开始，你可以把这个链接收藏到浏览器书签。将文件拖放到页面中加载，使用箭头键和空格键插入时间戳。

开发分支版本链接:

- https://magic-akari.github.io/lrc-maker/
- https://lrc-maker.vercel.app/

## 热键

|                            按键                             |        功能        |
| :---------------------------------------------------------: | :----------------: |
|                      <kbd>space</kbd>                       |    插入时间标签    |
|   <kbd>backspace</kbd> / <kbd>delete</kbd> / <kbd>⌫</kbd>   |    移除时间标签    |
| <kbd>ctrl</kbd><kbd>enter↵</kbd> / <kbd>⌘</kbd><kbd>↩</kbd> |    播放 / 暂停     |
|                 <kbd>←</kbd> / <kbd>A</kbd>                 |     回退 5 秒      |
|                 <kbd>→</kbd> / <kbd>D</kbd>                 |     前进 5 秒      |
|         <kbd>↑</kbd> / <kbd>W</kbd> / <kbd>J</kbd>          |     选择上一行     |
|         <kbd>↓</kbd> / <kbd>S</kbd> / <kbd>K</kbd>          |     选择下一行     |
|                 <kbd>-</kbd> / <kbd>+</kbd>                 | 当前行时间标签微调 |
|   <kbd>ctrl</kbd><kbd>↑</kbd> / <kbd>⌘</kbd><kbd>↑</kbd>    |    提高播放速度    |
|   <kbd>ctrl</kbd><kbd>↓</kbd> / <kbd>⌘</kbd><kbd>↓</kbd>    |    降低播放速度    |
|                        <kbd>R</kbd>                         |    重置播放速度    |

## 兼容性

本项目的目标是兼容大部分现代浏览器，当前版本使用了很多的现代浏览器 API 来提升效能，改善用户体验。
本项目使用了 ES Module 来加载代码，这意味着浏览器的版本应该满足下列要求。

| 浏览器  | 版本  |
| :------ | :---- |
| EDGE    | >= 16 |
| Firefox | >= 60 |
| Chrome  | >= 61 |
| Safari  | >= 11 |
| ios_saf | >= 11 |

<del>
当前版本的 Edge 理论上应该支持，但是目前有不明原因导致代码加载后没有运行，这个问题留到 V8 内核的 Edge 发布后再做观察。
</del>

对 EDGE 浏览器低限度支持。

对于没有 ES Module 支持的浏览器，仍然做了回退处理以便正常使用。注意：此部分没有进行测试，旧浏览器仍然可能遇到 css 的布局错乱问题。

IE 等旧浏览器不再支持。对于这类浏览器使用者，可以使用本项目的[旧版本][version 3.x]。

## 本地开发

如果你想在本地计算机上运行这个项目，可以遵循下面操作。

```bash
# 克隆这个仓库
git clone https://github.com/magic-akari/lrc-maker.git

cd lrc-maker

# 安装依赖
npm i

# 构建
npm run build

# 开发模式构建
npm start
```

## 生产部署

构建（`npm run build`）后，`build` 文件夹是静态网站文件。
您可以将其部署到任何 CDN 或静态文件服务器。

您还可以使用此存储库根目录下的 `Dockerfile` 构建一个 docker 镜像。
它运行构建并创建最小化的 nginx 镜像。

```bash
# 构建
docker build -t lrc-maker .
# 创建一个容器并在 8080 端口提供服务
docker run -d -p 8080:80 lrc-maker
```

## 给这个项目点一个星星 :star:

如果你喜欢这个项目，请点一个星星吧 :star:，同时分享这个项目来帮助更多的人。

[lrc maker]: https://lrc-maker.github.io
[version 3.x]: https://lrc-maker.github.io/3.x
