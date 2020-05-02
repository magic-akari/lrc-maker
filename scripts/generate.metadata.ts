import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import { format, Options } from "prettier";
import * as options from "../.prettierrc.json";
import { name, version } from "../package.json";

const jsdelivr = "https://cdn.jsdelivr.net";
const useCDN = process.env.USE_CDN === "USE_CDN";

const appScript = (path: string): string => {
    if (useCDN) {
        return new URL(resolve("/npm", `${name}@${version}`, "build", path), jsdelivr).href;
    } else {
        return path;
    }
};

const hash = ((): string => {
    const root = resolve(__dirname, "../");
    const rev = readFileSync(resolve(root, ".git/HEAD")).toString().trim();
    if (!rev.includes(":")) {
        return rev;
    } else {
        return readFileSync(resolve(root, ".git/", rev.slice(5))).toString();
    }
})().slice(0, 7);

const updateTime = execSync("git log -1 --format=%cI").toString().trim();

const versionTs = `declare global {
    const enum MetaData {
        version = ${JSON.stringify(version)},
        hash = ${JSON.stringify(hash)},
        updateTime = ${JSON.stringify(updateTime)},
        akariOdangoLoading = ${JSON.stringify(appScript("./svg/akari-odango-loading.svg"))},
        akariHideWall = ${JSON.stringify(appScript("./svg/akari-hide-wall.svg"))},
        akariNotFound = ${JSON.stringify(appScript("./svg/akari-not-found.svg"))},
    }
}

export {};
`;

process.stdout.write(
    format(versionTs, {
        ...(options as Options),
        parser: "typescript",
    }),
);
