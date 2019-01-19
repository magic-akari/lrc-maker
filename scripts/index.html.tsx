import { execSync } from "child_process";
import { sync as glob } from "fast-glob";
import { readdirSync, readFileSync } from "fs";
import { parse, resolve } from "path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { sri, sriContent } from "./sri";

// tslint:disable-next-line:no-var-requires
const { name, version, description, dependencies } = require("../package.json");

const hash = (() => {
    const root = resolve(__dirname, "../");
    const rev = readFileSync(resolve(root, ".git/HEAD"))
        .toString()
        .trim();
    if (!rev.includes(":")) {
        return rev;
    } else {
        return readFileSync(resolve(root, ".git/", rev.slice(5))).toString();
    }
})().slice(0, 7);

const isProduction = process.env.NODE_ENV === "production";
const useCDN = process.env.USE_CDN === "USE_CDN";

const jsdelivr = "https://cdn.jsdelivr.net";
const nodeModules = "../node_modules/";

const libUrl = (
    libName: string,
    prodPath: string,
    devPath?: string,
): {
    src: string;
    integrity?: string;
    crossOrigin?: "anonymous";
} => {
    if (useCDN) {
        const libVersion = (() => {
            const v = dependencies[libName];

            return v[0] === "~" || v[0] === "^" ? v.slice(1) : v;
        })();

        const src = `${jsdelivr}/npm/${libName}@${libVersion}${prodPath}`;
        const integrity = sri(
            resolve(__dirname, `${nodeModules}${libName}${prodPath}`),
        );
        return { src, integrity, crossOrigin: "anonymous" };
    } else {
        return {
            src: `${nodeModules}${libName}${
                isProduction ? prodPath : devPath || prodPath
            }`,
        };
    }
};

const appUrl = (
    path: string,
): {
    src: string;
    integrity?: string;
    crossOrigin?: "anonymous";
} => {
    if (useCDN) {
        const src = new URL(
            resolve("/npm", `${name}@${version}`, "build", path),
            `${jsdelivr}`,
        ).href;
        const integrity = sri(resolve(__dirname, "../build", path));
        return { src, integrity, crossOrigin: "anonymous" };
    } else {
        return { src: path };
    }
};

const getLanguageMap = (): { [filename: string]: string } => {
    const langDir = resolve(__dirname, "../src/languages");
    const fileList = readdirSync(langDir);

    return fileList.reduce((map, filename) => {
        const { language } = require(resolve(langDir, filename));

        return {
            ...map,
            [parse(filename).name]: language.languageName,
        };
    }, {});
};

const swRegister = () => {
    const content = readFileSync(resolve(__dirname, "sw.register.js"), {
        encoding: "utf8",
    }).replace(/\s*[\r\n]+\s*|\s*\/\/.*/g, " ");

    const integrity = sriContent(content);

    return { content, integrity };
};

const swUnregister = () => {
    let content = readFileSync(
        resolve(__dirname, "../src/utils/sw.unregister.ts"),
        {
            encoding: "utf8",
        },
    );

    content = content.replace("export", "") + "unregister();";

    const integrity = sriContent(content);

    return { content, integrity };
};

const csp = {
    "default-src": ["'none'"],
    "img-src": ["'self'", "data:"],
    "style-src": ["'self'", jsdelivr],
    "script-src": ["'self'", "blob:", jsdelivr],
    "child-src": ["'self'"],
    "media-src": ["'self'", "blob:", "*"],
    "connect-src": ["blob:", "https://api.github.com"],
};

const buildPath = resolve(__dirname, "../build");

const preloadScripts = glob(buildPath + "/*/*.js")
    .map((path) => {
        return (path as string).replace(buildPath, ".");
    })
    .filter((path) => {
        return !path.includes("languages");
    })
    .map((path) => {
        return appUrl(path);
    });

preloadScripts.find((script) => {
    return script.src.includes("useLang.js");
})!.integrity = undefined;

const Html = () => {
    const updateTime = execSync("git log -1 --format=%cI")
        .toString()
        .trim();

    const reg = isProduction ? swRegister() : swUnregister();

    if (isProduction) {
        csp["script-src"].push(`'${reg.integrity}'`);
    } else {
        csp["script-src"].push("'unsafe-inline'");
        csp["connect-src"].push("*");
    }

    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>LRC Maker</title>
                <meta
                    httpEquiv="Content-Security-Policy"
                    content={Object.entries(csp)
                        .map(([key, value]) => {
                            return [key, ...value].join(" ");
                        })
                        .join("; ")}
                />
                <meta name="description" content={description} />
                <meta
                    name="keywords"
                    content="lrc maker, lrc generate, 歌词制作, 歌词滚动"
                />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="renderer" content="webkit" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="google" content="notranslate" />

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

                <meta name="application-name" content="灯里的歌词滚动姬" />
                <meta name="msapplication-TileColor" content="#ffffff" />
                <meta name="theme-color" content="#ffffff" />
                <meta
                    name="msapplication-config"
                    content="./favicons/browserconfig.xml"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content="灯里的歌词滚动姬"
                />
                <link
                    rel="stylesheet"
                    {...(() => {
                        if (isProduction) {
                            const {
                                src: href,
                                integrity,
                                crossOrigin,
                            } = appUrl("./index.css");
                            return { href, integrity, crossOrigin };
                        }

                        return { href: "../src/index.css" };
                    })()}
                />
                <script
                    {...libUrl(
                        "react",
                        "/umd/react.production.min.js",
                        "/umd/react.development.js",
                    )}
                />
                <script
                    {...libUrl(
                        "react-dom",
                        "/umd/react-dom.production.min.js",
                        "/umd/react-dom.development.js",
                    )}
                />
                <script {...appUrl("./polyfill.js")} async={true} />
                <script {...appUrl("./languages/en-US.js")} type="module" />
                {preloadScripts.map((script, index) => {
                    return <script key={index} {...script} type="module" />;
                })}
                <script
                    id="app-info"
                    type="application/json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            version,
                            hash,
                            updateTime,
                            languages: getLanguageMap(),
                        }),
                    }}
                />
            </head>
            <body>
                <div className="app-container" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: reg.content,
                    }}
                />
            </body>
        </html>
    );
};

process.stdout.write("<!DOCTYPE html>" + renderToStaticMarkup(<Html />));
