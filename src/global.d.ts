import { language } from "./languages/en-US";

/* eslint-disable @typescript-eslint/interface-name-prefix */
declare global {
    export namespace React {
        function useContext<T>(context: Context<T>, observedBits?: number | boolean): T;
        function createContext<T>(defaultValue?: T, calculateChangedBits?: (prev: T, next: T) => number): Context<T>;

        interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
            onToggle?: () => void;
        }
    }
    export namespace ReactDOM {}

    export namespace dialogPolyfill {
        const registerDialog: (element: Element) => void;
    }

    type Mutable<T> = { -readonly [P in keyof T]: T[P] };

    type Language = typeof language;

    type Fixed = 0 | 1 | 2 | 3;

    const enum Path {
        home = "#/",
        homeID = "/",
        editor = "#/editor/",
        editorID = "/editor/",
        synchronizer = "#/synchronizer/",
        synchronizerID = "/synchronizer/",
        gist = "#/gist/",
        gistID = "/gist/",
        preferences = "#/preferences/",
        preferencesID = "/preferences/",
    }

    // localStorage key
    const enum LSK {
        lyric = "lrc-maker-lyric",
        preferences = "lrc-maker-preferences",
        token = "lrc-maker-oauth-token",
        gistId = "lrc-maker-gist-id",
        gistEtag = "lrc-maker-gist-etag",
        gistFile = "lrc-maker-gist-file",
    }

    // sessionStorage key
    const enum SSK {
        audioSrc = "audio-src",
        editorDetailsOpen = "editor-details-open",
        syncMode = "sync-mode",
        selectIndex = "select-index",
        ratelimit = "x-ratelimit",
    }

    const enum Repo {
        url = "https://github.com/magic-akari/lrc-maker",
        wiki = "https://github.com/magic-akari/lrc-maker/wiki",
        issues = "https://github.com/magic-akari/lrc-maker/issues",
    }

    interface String {
        trimStart(): string;
        trimEnd(): string;
        trimLeft(): string;
        trimRight(): string;
    }

    const enum Const {
        emptyString = "",
        space = " ",
    }
}
