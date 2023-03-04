import { swc } from "rollup-plugin-swc3";
import { defineConfig } from "vite";
import externalGlobals, { libPreset } from "vite-plugin-external-globals";
import { hash, updateTime, version } from "./scripts/meta";

export default defineConfig({
    clearScreen: false,
    json: {
        stringify: true,
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
        alias: [{ find: /^npm:(.*)/, replacement: "$1" }],
    },
    base: "./",
    define: {
        "import.meta.env.app": JSON.stringify({ hash, updateTime, version }),
    },
    build: {
        minify: false,
        outDir: "build",
    },
});
