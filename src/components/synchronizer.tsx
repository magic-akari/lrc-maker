import { Action as LrcAction, ActionType as LrcActionType } from "../hooks/useLrc.js";
import { State as PrefState } from "../hooks/usePref.js";
import { convertTimeToTag, formatText, ILyric, State as LrcState, stringify } from "../lrc-parser/lrc-parser.js";
import { audioRef, currentTimePubSub } from "../utils/audiomodule.js";
import { appContext } from "./app.context.js";
import { AsidePanel } from "./asidepanel.js";
import { Curser } from "./curser.js";

const { useCallback, useContext, useEffect, useMemo, useRef, useState } = React;

const SpaceButton: React.FC<{ sync: () => void }> = ({ sync }) => {
    return (
        <button className="space_button" onClick={sync}>
            space
        </button>
    );
};

export const enum SyncMode {
    select,
    highlight,
}

const cachedState = {
    selectedLine: 0,
};

interface ISynchronizerProps {
    lrcState: LrcState;
    lrcDispatch: React.Dispatch<LrcAction>;
}

export const Synchronizer: React.FC<ISynchronizerProps> = ({ lrcState, lrcDispatch }) => {
    const self = useRef(Symbol(Synchronizer.name));

    const { prefState } = useContext(appContext);

    useEffect(() => {
        lrcDispatch({
            type: LrcActionType.set_info,
            payload: {
                name: "tool",
                value: "lrc-maker (https://lrc-maker.github.io)",
            },
        });
    }, []);

    const lyric = lrcState.lyric;

    const guard = useCallback(
        (value: number, min: number = 0, max: number = lyric.length - 1) => {
            if (value < min) {
                return min;
            }
            if (value > max) {
                return max;
            }
            return value;
        },
        [lyric.length],
    );

    const [selectIndex, setSelectIndex] = useState(guard(cachedState.selectedLine));

    const [highlightIndex, setHighlightIndex] = useState(-Infinity);

    const [syncMode, setSyncMode] = useState(
        sessionStorage.getItem(SSK.syncMode) === SyncMode.highlight.toString() ? SyncMode.highlight : SyncMode.select,
    );

    useEffect(() => {
        sessionStorage.setItem(SSK.syncMode, syncMode.toString());
    }, [syncMode]);

    const ul = useRef<HTMLUListElement>(null);

    const needScrollLine = {
        [SyncMode.select]: selectIndex,
        [SyncMode.highlight]: highlightIndex,
    }[syncMode];

    useEffect(() => {
        const line = ul.current!.children[needScrollLine];
        if (line !== undefined) {
            line.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    }, [needScrollLine]);

    const trackedLine = useRef(calcTrackedLine(lrcState.lyric));

    useEffect(() => {
        trackedLine.current = calcTrackedLine(lrcState.lyric);
        setHighlightIndex(trackedLine.current.currentIndex);
    }, [lrcState]);

    useEffect(() => {
        setHighlightIndex(trackedLine.current.currentIndex);

        currentTimePubSub.sub(self.current, (time) => {
            //
            // inefficient method
            //
            // const { index } = lyric.reduce(
            //     (p, c, i) => {
            //         if (c.time && c.time > p.time! && c.time < time) {
            //             p.time = c.time;
            //             p.index = i;
            //         }
            //         return p;
            //     },
            //     { time: 0, index: 0 },
            // );
            // setHighLight(index);

            if (time >= trackedLine.current.currentTime && time < trackedLine.current.nextTime) {
                return;
            } else {
                trackedLine.current = calcTrackedLine(lyric);
                setHighlightIndex(trackedLine.current.currentIndex);
            }
        });

        return () => {
            currentTimePubSub.unsub(self.current);
        };
    }, []);

    const sync = useCallback(() => {
        if (!audioRef.duration) {
            return;
        }

        lrcDispatch({
            type: LrcActionType.set_time,
            payload: {
                index: selectIndex,
                time: audioRef.currentTime,
            },
        });
        setSelectIndex(guard(selectIndex + 1));
    }, [selectIndex]);

    useEffect(() => {
        const deleteTimeTag = () => {
            lrcDispatch({
                type: LrcActionType.set_time,
                payload: {
                    index: selectIndex,
                    time: undefined,
                },
            });
        };

        const listener = (ev: KeyboardEvent) => {
            const { code, key, target } = ev;

            if (["text", "textarea", "url"].includes((target as any).type as string)) {
                return;
            }

            if (code === "Backspace" || code === "Delete" || key === "Backspace" || key === "Delete" || key === "Del") {
                ev.preventDefault();
                deleteTimeTag();
                return;
            }

            if (ev.metaKey === true || ev.ctrlKey === true) {
                return;
            }

            if (code === "Space" || key === " " || key === "Spacebar") {
                ev.preventDefault();

                sync();
            } else if (
                ["ArrowUp", "KeyW", "KeyJ"].includes(code) ||
                ["ArrowUp", "Up", "W", "w", "J", "j"].includes(key)
            ) {
                ev.preventDefault();

                setSelectIndex(guard(selectIndex - 1));
            } else if (
                ["ArrowDown", "KeyS", "KeyK"].includes(code) ||
                ["ArrowDown", "Down", "S", "s", "K", "k"].includes(key)
            ) {
                ev.preventDefault();

                setSelectIndex(guard(selectIndex + 1));
            } else if (code === "Home" || key === "Home") {
                ev.preventDefault();

                setSelectIndex(0);
            } else if (code === "End" || key === "End") {
                ev.preventDefault();

                setSelectIndex(lyric.length - 1);
            } else if (code === "PageUp" || key === "PageUp") {
                ev.preventDefault();

                setSelectIndex(guard(selectIndex - 10));
            } else if (code === "PageDown" || key === "PageDown") {
                ev.preventDefault();

                setSelectIndex(guard(selectIndex + 10));
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);

            cachedState.selectedLine = selectIndex;
        };
    }, [selectIndex]);

    const onLineClick = useCallback((ev: React.MouseEvent<HTMLUListElement & HTMLLIElement>) => {
        ev.stopPropagation();

        if ((ev.target as any).classList.contains("line")) {
            const lineKey = Number.parseInt((ev.target as HTMLElement).dataset.key!, 10) || 0;

            setSelectIndex(lineKey);
        }
    }, []);

    const onLineDoubleClick = useCallback((ev: React.MouseEvent<HTMLUListElement | HTMLLIElement>) => {
        ev.stopPropagation();

        if (!audioRef.duration) {
            return;
        }

        const target = ev.target as HTMLElement;

        if (target.classList.contains("line")) {
            const key = Number.parseInt(target.dataset.key!, 10);

            const time = lyric[key].time;

            if (time !== undefined) {
                audioRef.currentTime = guard(time, 0, audioRef.duration);
            }
        }
    }, []);

    const lrcStateRef = useRef(lrcState);
    lrcStateRef.current = lrcState;

    const createDownloadFile = useCallback(() => {
        return stringify(lrcStateRef.current, prefState);
    }, [prefState]);

    const ulClassName = useMemo(() => {
        if (prefState.screenButton) {
            return "lyric-list on-screen-button";
        }
        return "lyric-list";
    }, [prefState.screenButton]);

    const LyricLineIter = useCallback(
        (line: Readonly<ILyric>, index: number, lines: Array<Readonly<ILyric>>) => {
            const select = index === selectIndex;
            const highlight = index === highlightIndex;
            const error = index > 0 && lines[index].time! <= lines[index - 1].time!;

            const className = Object.entries({
                line: true,
                select,
                highlight,
                error,
            })
                .reduce(
                    (p, [name, value]) => {
                        if (value) {
                            p.push(name);
                        }
                        return p;
                    },
                    [] as string[],
                )
                .join(Const.space);

            return <LyricLine line={line} index={index} select={select} className={className} prefState={prefState} />;
        },
        [selectIndex, highlightIndex, prefState],
    );

    return (
        <>
            <ul ref={ul} className={ulClassName} onClickCapture={onLineClick} onDoubleClickCapture={onLineDoubleClick}>
                {lrcState.lyric.map(LyricLineIter)}
            </ul>
            <AsidePanel
                syncMode={syncMode}
                setSyncMode={setSyncMode}
                createDownloadFile={createDownloadFile}
                lrcInfo={lrcState.info}
            />
            {prefState.screenButton && <SpaceButton sync={sync} />}
        </>
    );
};

interface ILyricLineProps {
    line: ILyric;
    index: number;
    select: boolean;
    className: string;
    prefState: PrefState;
}

const LyricLine: React.FC<ILyricLineProps> = ({ line, index, select, className, prefState }) => {
    const lineTime = convertTimeToTag(line.time, prefState.fixed);

    const lineText = formatText(line.text, prefState.spaceStart, prefState.spaceEnd);

    return (
        <li key={index} data-key={index} className={className}>
            {select && <Curser fixed={prefState.fixed} />}
            <time className="line-time">{lineTime}</time>
            <span className="line-text">{lineText}</span>
        </li>
    );
};

const calcTrackedLine = (lyric: Array<Readonly<ILyric>>) => {
    const audioTime = audioRef.currentTime;

    return lyric.reduce(
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
};
