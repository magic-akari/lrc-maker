import { ILyric, parser, State } from "../lrc-parser/lrc-parser.js";

export const enum ActionType {
    set_time,
    set_info,
    parse,
}

type Map_Type_Payload<T, U> = { [key in keyof T]: U extends key ? { type: key; payload: T[key] } : never }[keyof T];

export type Action = Map_Type_Payload<
    {
        [ActionType.set_info]: { name: string; value: string };
        [ActionType.set_time]: { index: number; time?: number };
        [ActionType.parse]: string;
    },
    ActionType
>;

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionType.set_time: {
            const { index, time } = action.payload;

            const newLyric: Array<Mutable<ILyric>> = state.lyric.slice();
            newLyric[index].time = time;

            return {
                info: state.info,
                lyric: newLyric,
            };
        }

        case ActionType.set_info: {
            const { name, value } = action.payload;

            const newInfo = new Map(state.info);
            if (value.trim() === "") {
                newInfo.delete(name);
            } else {
                newInfo.set(name, value.trim());
            }

            return {
                info: newInfo,
                lyric: state.lyric,
            };
        }

        case ActionType.parse: {
            return parser(action.payload);
        }
    }

    return state;
};

export const useLrc = (initText: string) => {
    const initialState = parser(initText);
    return React.useReducer(reducer, initialState);
};
