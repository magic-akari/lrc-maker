import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { swc } from "rollup-plugin-swc3";
import { defineConfig } from "vite";
import externalGlobals, { libPreset } from "vite-plugin-external-globals";
import { version } from "./package.json" assert { type: "json" };
import sw_plugin from "./plugins/sw-plugin";

const hash = execSync("git rev-parse --short HEAD").toString().trim();
const updateTime = execSync("git log -1 --format=%cI").toString().trim();

const json_suffix = ".json";
const lang_dir = "src/languages";

const langFileList = readdirSync(lang_dir).filter((filename) => filename.endsWith(json_suffix));
langFileList.sort();

interface LangContent {
    languageName: string;
}

const langMap = await Promise.all(
    langFileList.map(async (f) => {
        const filePath = join(lang_dir, f);
        const fileContent = await readFile(filePath, {
            encoding: "utf-8",
        });

        const langCode = f.slice(0, -json_suffix.length);
        const langJson = JSON.parse(fileContent) as LangContent;
        const languageName = langJson.languageName;
        return [langCode, languageName] as const;
    }),
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
            ],
        }),
        sw_plugin(),
    ],
    resolve: {
        alias: [
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
