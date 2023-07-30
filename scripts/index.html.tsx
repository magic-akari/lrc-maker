import { readdirSync, readFileSync } from "fs";
import { sync as glob } from "glob";
import { parse, resolve } from "path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { minify } from "terser";
import { description } from "../package.json";
import { getCDN } from "./cdn";
import { sriContent } from "./sri";

const isProduction = process.env.NODE_ENV === "production";

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

const swRegister = async (): Promise<Record<"content" | "integrity", string>> => {
    const { code } = await minify(readFile("sw.register.js"));
    const content = code as string;

    const integrity = sriContent(content);

    return { content, integrity };
};

const swUnregister = (): Record<"content" | "integrity", string> => {
    let content = readFile("../src/utils/sw.unregister.ts");

    content = content.replace("export", "") + "unregister();";

    const integrity = sriContent(content);

    return { content, integrity };
};

const fallback = async (path: string): Promise<Record<"content" | "integrity", string>> => {
    const { code } = await minify(readFile(path));
    const content = code as string;

    const integrity = sriContent(content);

    return { content, integrity };
};

const Html = async () => {
    const { CDN, libScript, appScript, preload } = getCDN();

    const libReact = libScript(isProduction ? "umd/react.production.min.js" : "umd/react.development.js", "react");
    const libReactDOM = libScript(
        isProduction ? "umd/react-dom.production.min.js" : "umd/react-dom.development.js",
        "react-dom",
    );
    const index = appScript("./index.js");
    const reg = isProduction ? await swRegister() : swUnregister();
    const fallback2es6 = await fallback("./fallback.es6.js");
    const fallback2es5 = await fallback("./fallback.es5.js");

    const SELF = "'self'";
    const csp = {
        "default-src": ["'none'"],
        "img-src": [SELF, CDN, "data:"],
        "style-src": [SELF, CDN],
        // 'unsafe-inline' will be ignored if there is a hsah in script-src
        //  https://www.w3.org/TR/CSP2/#directive-script-src
        "script-src": [
            SELF,
            CDN,
            "'unsafe-inline'",
            `'${fallback2es6.integrity}'`,
            `'${fallback2es5.integrity}'`,
            `'${reg.integrity}'`,
        ],
        "child-src": [SELF],
        "worker-src": [SELF],
        "media-src": [SELF, "blob:", "*"],
        "manifest-src": [SELF],
        "connect-src": ["blob:", "https://api.github.com"],
    };

    const akariOdangoLoading = appScript("./svg/akari-odango-loading.svg");

    const preloadModule = preload
        ? glob("./!(polyfill)/*.js", {
            cwd: resolve(__dirname, "../build"),
        }).map((path) => appScript(path))
        : [index];

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
                                return [key, ...Array.from(new Set(value))].join(" ");
                            })
                            .join("; ")}
                    />
                )}
                <meta name="description" content={description} />
                <meta name="keywords" content="lrc maker, lrc generate, 歌词制作, 歌词滚动" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="renderer" content="webkit" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
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

                {preloadModule.map((md) => <link rel="modulepreload" href={md.src} key={md.src} />)}

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

                <script {...index} type="module" defer={true} />
                {isProduction && (
                    <script {...appScript("./index.es6.js")} className="index-es6" noModule={true} defer={true} />
                )}

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

(async () => {
    process.stdout.write("<!DOCTYPE html>" + renderToStaticMarkup(await Html()));
})();
