import { swc } from "rollup-plugin-swc3";
import { defineConfig } from "vite";
import externalGlobals, { libPreset } from "vite-plugin-external-globals";
import { hash, updateTime, version } from "./scripts/meta";

import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const json_suffix = ".json";
const lang_dir = "src/languages";

const langFileList = readdirSync(lang_dir).filter((filename) => filename.endsWith(json_suffix));
langFileList.sort();

interface LangContent {
    languageName: string;
}

const langMap = await Promise.all(
    langFileList.map((f) =>
        readFile(join(lang_dir, f), {
            encoding: "utf-8",
        }).then((c) => [f.slice(0, -json_suffix.length), (JSON.parse(c) as LangContent).languageName] as const),
    ),
);

export default defineConfig({
    clearScreen: false,
    json: {
        namedExports: false,
    },
    plugins: [
        swc(),
        externalGlobals({
            injectTo: "body",
            integrity: true,
            crossorigin: "anonymous",
            entry: [
                libPreset("react"),
                libPreset("react-dom"),
                libPreset("react", { name: "npm:react", pkgName: "react" }),
                libPreset("react-dom", { name: "npm:react-dom", pkgName: "react-dom" }),
            ],
        }),
    ],
    resolve: {
        alias: [
            { find: /^npm:(.*)/, replacement: "$1" },
            { find: /^#const:(.*)/, replacement: "./src/const/$1" },
        ],
    },
    base: "./",
    define: {
        "import.meta.env.app": JSON.stringify({ hash, updateTime, version }),
        "i18n.langCodeList": JSON.stringify(langFileList.map((f) => f.slice(0, -json_suffix.length))),
        "i18n.langMap": JSON.stringify(langMap),
    },
    build: {
        minify: true,
        outDir: "build",
        modulePreload: {
            polyfill: false,
        },
        rollupOptions: {
            input: ["index.html", "worker/sw.ts"],
            output: {
                entryFileNames(chunkInfo) {
                    if (chunkInfo.name === "sw") {
                        return "sw.js";
                    }
                    return "assets/[name]-[hash].js";
                },
            },
        },
    },
});
