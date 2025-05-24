import { presets, tagBuilder } from "gen_dep_tag";
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { externals } from "rollup-plugin-externals";
import { swc } from "rollup-plugin-swc3";
import { defineConfig, type HtmlTagDescriptor } from "vite";
import pkg from "./package.json" with { type: "json" };
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

const tag = tagBuilder({ sri: true });

export default defineConfig({
    clearScreen: false,
    json: {
        namedExports: false,
    },
    plugins: [
        swc(),
        externals({
            react: "React",
            "react-dom": "ReactDOM",
        }),
        {
            name: "html-cdn-codegen",
            apply: "build",
            transformIndexHtml(html) {
                return {
                    html,
                    tags: [presets.react, presets["react-dom"]].map(tag).map(htmlTag),
                };
            },
        },
        sw_plugin(),
    ],
    base: "./",
    define: {
        "import.meta.env.app": JSON.stringify({ hash, updateTime, version: pkg.version }),
        "i18n.langCodeList": JSON.stringify(langFileList.map((f) => f.slice(0, -json_suffix.length))),
        "i18n.langMap": JSON.stringify(langMap),
    },
    css: {
        transformer: "lightningcss",
    },
    build: {
        minify: true,
        cssMinify: "lightningcss",
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

function htmlTag(meta: ReturnType<typeof tag>): HtmlTagDescriptor {
    const { url, integrity } = meta;
    return {
        tag: "script",
        attrs: {
            src: url,
            integrity,
            crossorigin: "anonymous",
        },
        injectTo: "head",
    };
}
