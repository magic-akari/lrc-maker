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

const initState = {
    lang: "en-US",
    spaceStart: 1,
    spaceEnd: 0,
    fixed: 3 as Fixed,
    builtInAudio: false,
    screenButton: false,
    themeColor: themeColor.pink,
};

export type State = Readonly<typeof initState>;

export type Action = { [key in keyof State]: { type: key; payload: State[key] } }[keyof State];

const reducer = (state: State, action: Action): State => {
    return {
        ...state,
        [action.type]: action.payload,
    };
};

const init = (lazyInit: () => string): State => {
    const state: Mutable<State> = initState;
    state.lang = navigator.language;
    try {
        const storedState: State = JSON.parse(lazyInit());
        const validKeys = Object.keys(initState) as Array<keyof State>;
        for (const key of validKeys) {
            if (key in storedState) {
                state[key] = storedState[key];
            }
        }
    } catch (error) {
        //
    }
    return state;
};

export const usePref = (lazyInit: () => string) => React.useReducer(reducer, lazyInit, init);
