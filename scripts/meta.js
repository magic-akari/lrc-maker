import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const hash = execSync("git rev-parse --short HEAD").toString().trim();

export const updateTime = execSync("git log -1 --format=%cI").toString().trim();

export const version = require("../package.json").version;
