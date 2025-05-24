import { useReducer } from "react";

export const themeColor = {
    orange: "#ff691f",
    yellow: "#fab81e",
    lime: "#7fdbb6",
    green: "#19cf86",
    blue: "#91d2fa",
    navy: "#1b95e0",
    grey: "#abb8c2",
    red: "#e81c4f",
    pink: "#f58ea8",
    purple: "#c877fe",
};

export const enum ThemeMode {
    auto,
    light,
    dark,
}

const initState = {
    lang: "en-US",
    spaceStart: 1,
    spaceEnd: 0,
    fixed: 3 as Fixed,
    builtInAudio: false,
    showWaveform: true,
    screenButton: false,
    themeColor: themeColor.pink,
    themeMode: ThemeMode.auto,
};

export type State = Readonly<typeof initState>;

export type Action = {
    [key in keyof State]: { type: key; payload: State[key] | ((state: State) => State[key]) };
}[keyof State];

const reducer = (state: State, action: Action): State => {
    const payload = action.payload;
    return {
        ...state,
        [action.type]: typeof payload === "function" ? payload(state) : payload,
    };
};

const langCodeList = i18n.langCodeList;

const init = (lazyInit: () => string): State => {
    const state: Mutable<State> = initState;

    const languages = navigator.languages || [navigator.language || "en-US"];

    state.lang = languages
        .map((langCode) => {
            if (langCode === "zh") {
                return "zh-CN";
            }
            if (langCode.startsWith("en")) {
                return "en-US";
            }
            return langCode;
        })
        .find((langCode) => langCodeList.includes(langCode)) || "en-US";

    try {
        const storedState = JSON.parse(lazyInit()) as State;
        const validKeys = Object.keys(initState) as (keyof State)[];
        for (const key of validKeys) {
            if (key in storedState) {
                (state[key] as unknown) = storedState[key];
            }
        }
    } catch {
        //
    }
    return state;
};

export const usePref = (lazyInit: () => string): [State, React.Dispatch<Action>] => useReducer(reducer, lazyInit, init);
