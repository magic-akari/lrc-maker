export const enum ActionType {
    set_time,
    set_info,
    parse,
}

type Map_Type_Payload<T, U> = {
    [key in keyof T]: U extends key ? { type: key; payload: T[key] } : never
}[keyof T];

export type Action = Map_Type_Payload<
    {
        [ActionType.set_info]: { name: string; value: string };
        [ActionType.set_time]: { index: number; time?: number };
        [ActionType.parse]: string;
    },
    ActionType
>;

export interface ILyric {
    time?: number;
    text: string;
}

export type State = Readonly<{
    info: Map<string, string>;
    lyric: Array<Readonly<ILyric>>;
}>;

const parser = (lrcString: string): State => {
    const lines = lrcString.split(/\r\n|\n|\r/);

    const timeTag = /\[\s*(\d{1,3}):(\d{1,2}(?:[:.]\d{1,3})?)\s*]/y;
    const infoTag = /\[\s*(\w{1,6})\s*:(.*?)]/;

    const info: Map<string, string> = new Map();
    const lyric: ILyric[] = [];

    for (const line of lines) {
        if (line[0] !== "[") {
            lyric.push({
                text: line,
            });
            continue;
        }

        // now, line starts with "["
        timeTag.lastIndex = 0;
        const rTimeTag = timeTag.exec(line);
        if (rTimeTag !== null) {
            const mm = Number.parseInt(rTimeTag[1], 10);
            const ss = Number.parseFloat(rTimeTag[2].replace(":", "."));
            const text = line.slice(timeTag.lastIndex);

            lyric.push({
                time: mm * 60 + ss,
                text,
            });

            continue;
        }

        const rInfoTag = infoTag.exec(line);
        if (rInfoTag !== null) {
            const value = rInfoTag[2].trim();

            if (value === "") {
                continue;
            }

            info.set(rInfoTag[1], value);

            continue;
        }

        // if we reach here, it means this line starts with "[",
        // but not match time tag or info tag.

        lyric.push({
            text: line,
        });
    }

    return { info, lyric };
};

type Fixed = 0 | 1 | 2 | 3;

interface IFormatOptions {
    spaceStart: number | null;
    spaceEnd: number | null;
    fixed: Fixed;
}

const storedFormaTter = new Map<Fixed, Intl.NumberFormat>();

export const getFormatter = (fixed: Fixed) => {
    if (storedFormaTter.has(fixed)) {
        return storedFormaTter.get(fixed)!;
    } else {
        const newFormatter = new Intl.NumberFormat("en", {
            minimumIntegerDigits: 2,
            minimumFractionDigits: fixed,
            maximumFractionDigits: fixed,
        });
        storedFormaTter.set(fixed, newFormatter);
        return newFormatter;
    }
};

export const convertTimeToTag = (
    time: number | undefined,
    formatter: Intl.NumberFormat,
    withBrackets = true,
) => {
    if (time === undefined) {
        return Const.emptyString;
    }

    const mm = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const ss = formatter.format(time % 60);

    return withBrackets ? `[${mm}:${ss}]` : `${mm}:${ss}`;
};

export const formatText = (
    text: string,
    spaceStart: number | null,
    spaceEnd: number | null,
) => {
    let newText = text;
    if (spaceStart !== null && spaceStart >= 0) {
        newText = Const.space.repeat(spaceStart) + newText.trimStart();
    }
    if (spaceEnd !== null && spaceEnd >= 0) {
        newText = newText.trimEnd() + Const.space.repeat(spaceEnd);
    }
    return newText;
};

export const stringify = (state: State, option: IFormatOptions): string => {
    const { spaceStart, spaceEnd, fixed } = option;

    const infos = Array.from(state.info.entries()).map(([name, value]) => {
        return `[${name}: ${value}]`;
    });

    const formatter = getFormatter(fixed);

    const lines = state.lyric.map((line) => {
        if (line.time === undefined) {
            return line.text;
        }
        const text = formatText(line.text, spaceStart, spaceEnd);

        return `${convertTimeToTag(line.time, formatter)}${text}`;
    });
    return infos.concat(lines).join("\r\n");
};

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

export const useLrc = (storedLrc: string) => {
    const initialState = parser(storedLrc);
    return React.useReducer(reducer, initialState);
};
