import { language } from "./languages/en-US";

declare global {
    export namespace React {}
    export namespace ReactDOM {}

    export namespace dialogPolyfill {
        const registerDialog: (element: Element) => void;
    }

    type Mutable<T> = { -readonly [P in keyof T]: T[P] };

    type Language = typeof language;

    const enum Path {
        home = "#/",
        homeID = "/",
        editor = "#/editor/",
        editorID = "/editor/",
        synchronizer = "#/synchronizer/",
        synchronizerID = "/synchronizer/",
        preferences = "#/preferences/",
        preferencesID = "/preferences/",
    }

    // localStorage key
    const enum LSK {
        lyric = "lrc-maker-lyric",
        preferences = "lrc-maker-preferences",
    }

    // sessionStorage key
    const enum SSK {
        audioSrc = "audio-src",
        editorDetailsOpen = "editor-details-open",
        syncMode = "sync-mode",
    }

    const enum JsdelivrDialog {
        src = "https://cdn.jsdelivr.net/npm/dialog-polyfill@0.4.10/dialog-polyfill.js",
        integrity = "sha256-MzKeKXV3W7bf3Uu0xLNN/SiVj3OBfBUzD3VmMb/yyCQ=",
    }

    interface String {
        trimStart(): string;
        trimEnd(): string;
        trimLeft(): string;
        trimRight(): string;
    }

    const enum ChangeBits {
        currentTime = 1 << 0,
        curser = 1 << 1,
        hightlight = 1 << 2,
        lrc = 1 << 3,
        preferences = 1 << 4,
        language = 1 << 5,
    }

    const enum Const {
        emptyString = "",
        space = " ",
    }
}

export {};
