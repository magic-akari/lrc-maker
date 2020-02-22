import { readdirSync, readFileSync } from "fs";
import { sync as glob } from "glob";
import { join, parse, resolve } from "path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { dependencies, description, name, version } from "../package.json";
import { sri, sriContent } from "./sri";

const isProduction = process.env.NODE_ENV === "production";
const useCDN = process.env.USE_CDN === "USE_CDN";

const jsdelivr = "https://cdn.jsdelivr.net";
const localPath = "./lib/";

interface IScriptProps {
    src: string;
    integrity?: string;
    crossOrigin?: "anonymous";
}

type ILibName = keyof typeof dependencies;

const libScript = (libName: ILibName, prodPath: string, devPath?: string): IScriptProps => {
    const integrity = isProduction
        ? sri(resolve(__dirname, "../build", localPath, `${libName}${prodPath}`))
        : undefined;

    if (useCDN) {
        const libVersion = ((): string => {
            const v = dependencies[libName];

            return /\d/.test(v[0]) ? v : v.slice(1);
        })();

        const src = `${jsdelivr}/npm/${libName}@${libVersion}${prodPath}`;

        return { src, integrity, crossOrigin: "anonymous" };
    } else {
        return {
            src: `${localPath}${libName}${isProduction ? prodPath : devPath || prodPath}`,
            integrity,
        };
    }
};

const appScript = (path: string): IScriptProps => {
    const integrity = isProduction ? sri(resolve(__dirname, "../build", path)) : undefined;

    if (useCDN) {
        const src = new URL(resolve("/npm", `${name}@${version}`, "build", path), jsdelivr).href;
        return { src, integrity, crossOrigin: "anonymous" };
    } else {
        return { src: path, integrity };
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

const readFile = (path: string): string => {
    return readFileSync(resolve(__dirname, path), {
        encoding: "utf8",
    });
};

const minify = (content: string): string => {
    const line = content.split(/\n/);
    return line
        .map((l) => l.replace(/\/\/\s.*$/, ""))
        .join("")
        .replace(/\s+/g, " ");
};

const swRegister = (): Record<"content" | "integrity", string> => {
    const content = minify(readFile("sw.register.js"));

    const integrity = sriContent(content);

    return { content, integrity };
};

const swUnregister = (): Record<"content" | "integrity", string> => {
    let content = readFile("../src/utils/sw.unregister.ts");

    content = content.replace("export", "") + "unregister();";

    const integrity = sriContent(content);

    return { content, integrity };
};

const fallback = (path: string): Record<"content" | "integrity", string> => {
    const content = minify(readFile(path));

    const integrity = sriContent(content);

    return { content, integrity };
};

const Html: React.FC = () => {
    const libReact = libScript("react", "/umd/react.production.min.js", "/umd/react.development.js");
    const libReactDOM = libScript("react-dom", "/umd/react-dom.production.min.js", "/umd/react-dom.development.js");
    const appCDN = new URL(join("/npm", `${name}@${version}`, "./"), jsdelivr).href;

    const SELF = "'self'";
    const csp = {
        "default-src": ["'none'"],
        "img-src": [SELF, "data:", appCDN],
        "style-src": [appCDN],
        // 'unsafe-inline' will be ignored if there is a hsah in script-src
        //  https://www.w3.org/TR/CSP2/#directive-script-src
        "script-src": ["'unsafe-inline'", appCDN],
        "child-src": [SELF],
        "worker-src": [SELF],
        "media-src": [SELF, "blob:", "*"],
        "manifest-src": [SELF],
        "connect-src": ["blob:", "https://api.github.com"],
    };

    const reg = isProduction ? swRegister() : swUnregister();

    if (useCDN) {
        csp["script-src"].push(libReact.src, libReactDOM.src);
    } else {
        csp["script-src"].unshift(SELF);
        csp["style-src"].unshift(SELF);
    }

    if (isProduction) {
        csp["script-src"].push(`'${reg.integrity}'`);
    } else {
        csp["connect-src"].push(SELF);
    }

    const fallback2es6 = fallback("./fallback.es6.js");
    const fallback2es5 = fallback("./fallback.es5.js");

    csp["script-src"].push(`'${fallback2es6.integrity}'`, `'${fallback2es5.integrity}'`);

    const akariOdangoLoading = appScript("./svg/akari-odango-loading.svg");

    const preloadModule = glob("./!(polyfill)/*.js", {
        cwd: resolve(__dirname, "../build"),
    }).map(appScript);

    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>LRC Maker</title>
                {isProduction && (
                    <meta
                        httpEquiv="Content-Security-Policy"
                        content={Object.entries(csp)
                            .map(([key, value]) => {
                                return [key, ...value].join(" ");
                            })
                            .join("; ")}
                    />
                )}
                <meta name="description" content={description} />
                <meta name="keywords" content="lrc maker, lrc generate, 歌词制作, 歌词滚动" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="renderer" content="webkit" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="google" content="notranslate" />

                <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="./favicons/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="./favicons/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="./favicons/favicon-16x16.png" />
                <link rel="manifest" href="./site.webmanifest" />
                <link rel="mask-icon" href="./favicons/safari-pinned-tab.svg" color="#ff4081" />
                <link rel="shortcut icon" href="./favicons/favicon.ico" />

                <meta name="application-name" content="灯里的歌词滚动姬" />
                <meta name="msapplication-TileColor" content="#ffffff" />
                <meta name="theme-color" content="#484848" />
                <meta name="msapplication-config" content="./favicons/browserconfig.xml" />
                <meta name="apple-mobile-web-app-title" content="灯里的歌词滚动姬" />

                <link
                    rel="preload"
                    href={libReact.src}
                    as="script"
                    integrity={libReact.integrity}
                    crossOrigin={libReact.crossOrigin}
                />
                <link
                    rel="preload"
                    href={libReactDOM.src}
                    as="script"
                    integrity={libReactDOM.integrity}
                    crossOrigin={libReactDOM.crossOrigin}
                />

                {preloadModule.map((md) => (
                    <link rel="modulepreload" href={md.src} key={md.src} />
                ))}

                <link
                    className="preload-akari-odango-loading"
                    rel="preload"
                    as="image"
                    href={akariOdangoLoading.src}
                    crossOrigin={akariOdangoLoading.crossOrigin}
                />

                <link
                    rel="stylesheet"
                    {...((): React.LinkHTMLAttributes<HTMLLinkElement> => {
                        if (isProduction) {
                            const { src: href, integrity, crossOrigin } = appScript("./index.css");
                            return { href, integrity, crossOrigin };
                        }

                        return { href: "../src/index.css" };
                    })()}
                />
            </head>
            <body>
                <div className="app-container" />
                <div className="page-loading">
                    <img
                        className="akari-odango-loading start-loading"
                        src={akariOdangoLoading.src}
                        alt="loading"
                        crossOrigin={akariOdangoLoading.crossOrigin}
                    />
                </div>
                <script
                    id="app-info"
                    type="application/json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            languages: getLanguageMap(),
                        }),
                    }}
                />

                <script {...libReact} defer={true} />
                <script {...libReactDOM} defer={true} />

                <script
                    noModule={true}
                    dangerouslySetInnerHTML={{
                        __html: fallback2es5.content,
                    }}
                />

                <script
                    type="module"
                    defer={true}
                    dangerouslySetInnerHTML={{
                        __html: fallback2es6.content,
                    }}
                />

                <script {...appScript("./polyfill/string.esnext.js")} defer={true} />

                <script {...appScript("./index.js")} type="module" defer={true} />
                <script {...appScript("./index.es6.js")} className="index-es6" noModule={true} defer={true} />

                <script
                    defer={true}
                    dangerouslySetInnerHTML={{
                        __html: reg.content,
                    }}
                />
            </body>
        </html>
    );
};

process.stdout.write("<!DOCTYPE html>" + renderToStaticMarkup(<Html />));
