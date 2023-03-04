export const enum Path {
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
export const enum LSK {
    lyric = "lrc-maker-lyric",
    preferences = "lrc-maker-preferences",
    token = "lrc-maker-oauth-token",
    gistId = "lrc-maker-gist-id",
    gistEtag = "lrc-maker-gist-etag",
    gistFile = "lrc-maker-gist-file",
}

// sessionStorage key
export const enum SSK {
    audioSrc = "audio-src",
    editorDetailsOpen = "editor-details-open",
    syncMode = "sync-mode",
    selectIndex = "select-index",
    ratelimit = "x-ratelimit",
}

export const enum Repo {
    url = "https://github.com/magic-akari/lrc-maker",
    wiki = "https://github.com/magic-akari/lrc-maker/wiki",
    issues = "https://github.com/magic-akari/lrc-maker/issues",
}

export const enum Const {
    emptyString = "",
    space = " ",
}
