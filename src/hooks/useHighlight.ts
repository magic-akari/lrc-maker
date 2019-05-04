import { ILyric } from "../lrc-parser.js";

const { useReducer } = React;

type InitArgs = Readonly<{
    lyric: readonly ILyric[];
    time: number;
}>;

type Action = Readonly<{
    lyric?: readonly ILyric[];
    time: number;
}>;

type State = Readonly<{
    lyric: readonly ILyric[];
    currentTime: number;
    currentIndex: number;
    nextTime: number;
    nextIndex: number;
}>;

const init = ({ lyric, time }: InitArgs) => {
    return reducer(
        {
            lyric,
            currentTime: Infinity,
            currentIndex: Infinity,
            nextTime: -Infinity,
            nextIndex: -Infinity,
        },
        { time },
    );
};

const reducer = (state: State, action: Action): State => {
    const { time: audioTime, lyric = state.lyric } = action;
    if (lyric === state.lyric && audioTime >= state.currentTime && audioTime < state.nextTime) {
        return state;
    }

    const record = lyric.reduce(
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

    return { ...record, lyric };
};

export const useHighlight = (initArgs: InitArgs) => useReducer(reducer, initArgs, init);
