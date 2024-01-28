import fs from "node:fs";
import type { Plugin } from "vite";

const register = fs.readFileSync(new URL("./sw.register.js", import.meta.url), "utf-8");
const un_register = fs.readFileSync(new URL("../src/utils/sw.unregister.ts", import.meta.url), "utf-8");

export default function(): Plugin {
    let is_prod = false;
    return {
        name: "sw-plugin",
        configResolved(env) {
            is_prod = env.command === "build";
        },
        transformIndexHtml(html) {
            return {
                html,
                tags: [{
                    tag: "script",
                    children: is_prod ? register : un_register.replace("export", "") + ";unregister()",
                    injectTo: "body",
                }],
            };
        },
    };
}
