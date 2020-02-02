import { parser, State as LrcState, TrimOptios } from "../lrc-parser.js";

type InitArgs = Readonly<{
    text: string;
    options: TrimOptios;
    select: number;
}>;

export const enum ActionType {
    parse,
    refresh,
    sync,
    info,
    select,
    deleteTime,
    getState,
}

export interface IState extends LrcState {
    readonly currentTime: number;
    readonly currentIndex: number;
    readonly nextTime: number;
    readonly nextIndex: number;
    readonly selectIndex: number;
}

type Map$Type$Payload<T, U> = { [key in keyof T]: U extends key ? { type: key; payload: T[key] } : never }[keyof T];

export type Action = Map$Type$Payload<
    {
        [ActionType.parse]: { text: string; options: TrimOptios };
        [ActionType.refresh]: number;
        [ActionType.sync]: number;
        [ActionType.info]: { name: string; value: string };
        [ActionType.select]: (index: number) => number;
        [ActionType.deleteTime]: undefined;
        [ActionType.getState]: (state: IState) => void;
    },
    ActionType
>;

export const guard = (value: number, min: number, max: number): number => {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
};

const mergeObject = <T extends O, O>(target: T, obj: O): T => {
    for (const i in obj) {
        if (target[i] !== obj[i]) {
            return { ...target, ...obj };
        }
    }

    return target;
};

const reducer = (state: IState, action: Action): IState => {
    switch (action.type) {
        case ActionType.parse: {
            const { text, options } = action.payload;
            const lrc = parser(text, options);
            const selectIndex = guard(state.selectIndex, 0, lrc.lyric.length - 1);
            return { ...state, ...lrc, selectIndex };
        }

        case ActionType.refresh: {
            const audioTime = action.payload;
            if (audioTime >= state.currentTime && audioTime < state.nextTime) {
                return state;
            }

            const record = state.lyric.reduce(
                (p, c, i) => {
                    if (c.time) {
                        if (c.time < p.nextTime && c.time > audioTime) {
                            p.nextTime = c.time;
                            p.nextIndex = i;
                        }
                        if (c.time > p.currentTime && c.time <= audioTime) {
                            p.currentTime = c.time;
                            p.currentIndex = i;
                        }
                    }
                    return p;
                },
                {
                    currentTime: -Infinity,
                    currentIndex: -Infinity,
                    nextTime: Infinity,
                    nextIndex: Infinity,
                },
            );

            return mergeObject(state, record);
        }

        case ActionType.sync: {
            const time = action.payload;
            const index = state.selectIndex;

            let lyric = state.lyric;
            if (lyric[index].time !== time) {
                const newLyric = lyric.slice();
                newLyric[index] = { text: lyric[index].text, time };
                lyric = newLyric;
            }

            const selectIndex = guard(index + 1, 0, lyric.length - 1);

            return { ...state, lyric, selectIndex, currentTime: time, nextTime: -Infinity };
        }

        case ActionType.info: {
            const { name, value } = action.payload;

            const info = new Map(state.info);
            if (value.trim() === "") {
                info.delete(name);
            } else {
                info.set(name, value.trim());
            }

            return {
                ...state,
                info,
            };
        }

        case ActionType.select: {
            const selectIndex = guard(action.payload(state.selectIndex), 0, state.lyric.length - 1);
            return state.selectIndex === selectIndex ? state : { ...state, selectIndex };
        }

        case ActionType.deleteTime: {
            const { selectIndex, currentIndex } = state;

            let lyric = state.lyric;
            if (lyric[selectIndex].time !== undefined) {
                const newLyric = lyric.slice();
                newLyric[selectIndex] = { text: lyric[selectIndex].text };
                lyric = newLyric;

                let { currentTime, nextTime } = state;
                if (selectIndex === currentIndex) {
                    currentTime = Infinity;
                    nextTime = -Infinity;
                }

                return {
                    ...state,
                    lyric,
                    currentTime,
                    nextTime,
                };
            }

            return state;
        }

        case ActionType.getState: {
            action.payload(state);
            return state;
        }
    }

    return state;
};

const init = (lazyInit: () => InitArgs): IState => {
    const { text, options, select } = lazyInit();
    return {
        ...parser(text, options),
        currentTime: Infinity,
        currentIndex: Infinity,
        nextTime: -Infinity,
        nextIndex: -Infinity,
        selectIndex: select,
    };
};

export const useLrc = (lazyInit: () => InitArgs): [IState, React.Dispatch<Action>] =>
    React.useReducer(reducer, lazyInit, init);
