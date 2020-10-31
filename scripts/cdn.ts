import { join, relative, resolve } from "path";
import { dependencies, name, version } from "../package.json";
import { sri } from "./sri";

export const useCDN = process.env.USE_CDN;

interface IScriptProps {
    src: string;
    integrity?: string;
    crossOrigin?: "anonymous";
}

type ILibName = keyof typeof dependencies;

const libVersion = (libName: ILibName): string => {
    const v = dependencies[libName];

    return /\d/.test(v[0]) ? v : v.slice(1);
};

const jsdelivr = () => {
    const CDN = "https://cdn.jsdelivr.net";

    const libScript = (path: string, libName: ILibName): IScriptProps => {
        const integrity = sri(resolve(__dirname, "../build/lib", libName, path));

        const src = new URL(join("/npm", `${libName}@${libVersion(libName)}`, path), CDN).href;

        return { src, integrity, crossOrigin: "anonymous" };
    };

    // path relative to build
    const appScript = (path: string): IScriptProps => {
        const integrity = sri(resolve(__dirname, "../build", path));

        const src = new URL(join("/npm", `${name}@${version}`, "build", path), CDN).href;

        return { src, integrity, crossOrigin: "anonymous" };
    };

    return { CDN, libScript, appScript, preload: true };
};

const unpkg = () => {
    const CDN = "https://unpkg.com";

    const libScript = (path: string, libName: ILibName): IScriptProps => {
        const integrity = sri(resolve(__dirname, "../build/lib", libName, path));

        const src = new URL(join(`${libName}@${libVersion(libName)}`, path), CDN).href;

        return { src, integrity, crossOrigin: "anonymous" };
    };

    // path relative to build
    const appScript = (path: string): IScriptProps => {
        const integrity = sri(resolve(__dirname, "../build", path));

        const src = new URL(join(`${name}@${version}`, "build", path), CDN).href;

        return { src, integrity, crossOrigin: "anonymous" };
    };

    return { CDN, libScript, appScript, preload: true };
};

const jsdelivrESM = () => {
    const CDN = "https://cdn.jsdelivr.net";

    const libScript = (path: string, libName: ILibName): IScriptProps => {
        const integrity = sri(resolve(__dirname, "../build/lib", libName, path));

        const src = new URL(join("/npm", `${libName}@${libVersion(libName)}`, path), CDN).href;

        return { src, integrity, crossOrigin: "anonymous" };
    };

    // path relative to build
    const appScript = (path: string): IScriptProps => {
        const src = new URL(join("/npm", `${name}@${version}`, "build", path, path.endsWith(".js") ? "+esm" : ""), CDN)
            .href;

        return { src, crossOrigin: "anonymous" };
    };

    return { CDN, libScript, appScript, preload: false };
};

const noCDN = () => {
    const CDN = "'self'";

    const libScript = (path: string, libName: ILibName): IScriptProps => {
        const buildDir = resolve(__dirname, "../build");
        const realPath = resolve(__dirname, "../build/lib", libName, path);

        const integrity = sri(realPath);

        const src = "./" + relative(buildDir, realPath);

        return { src, integrity, crossOrigin: "anonymous" };
    };

    // path relative to build
    const appScript = (path: string): IScriptProps => {
        const integrity = sri(resolve(__dirname, "../build", path));

        return { src: path, integrity, crossOrigin: "anonymous" };
    };

    return { CDN, libScript, appScript, preload: true };
};

export const getCDN = () => {
    if (useCDN === "jsdelivr") {
        return jsdelivr();
    }

    if (useCDN === "jsdelivr+esm") {
        return jsdelivrESM();
    }

    if (useCDN === "unpkg") {
        return unpkg();
    }

    return noCDN();
};
