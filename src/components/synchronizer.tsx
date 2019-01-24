import {
    Action as LrcAction,
    ActionType as LrcActionType,
    convertTimeToTag,
    formatText,
    State as LrcState,
    stringify,
} from "../hooks/useLrc.js";
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

export const Synchronizer: React.FC<ISynchronizerProps> = ({
    lrcState,
    lrcDispatch,
}) => {
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

    const ul = useRef<HTMLUListElement>(null);

    const guard = useCallback(
        (value: number, min = 0, max = lyric.length - 1) => {
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

    const [selectedLine, setSelectLine] = useState(
        guard(cachedState.selectedLine),
    );

    const [syncMode, setSyncMode] = useState(
        sessionStorage.getItem(SSK.syncMode) === SyncMode.highlight.toString()
            ? SyncMode.highlight
            : SyncMode.select,
    );

    const [highLight, setHighLight] = useState(0);
    const [needReCalc, setNeedReCalc] = useState(Symbol());

    useEffect(() => {
        sessionStorage.setItem(SSK.syncMode, syncMode.toString());
    }, [syncMode]);

    const needScrollLine = {
        [SyncMode.select]: selectedLine,
        [SyncMode.highlight]: highLight,
    }[syncMode];

    useEffect(() => {
        ul.current!.children[needScrollLine].scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }, [needScrollLine]);

    const trackedLine = useMemo(() => {
        return lyric.reduce(
            (p, c, i) => {
                if (c.time) {
                    if (c.time < p.nextTime && c.time > audioRef.currentTime) {
                        p.nextTime = c.time;
                        p.nextIndex = i;
                    }
                    if (
                        c.time > p.currentTime &&
                        c.time <= audioRef.currentTime
                    ) {
                        p.currentTime = c.time;
                        p.currentIndex = i;
                    }
                }
                return p;
            },
            {
                currentTime: 0,
                currentIndex: 0,
                nextTime: Infinity,
                nextIndex: Infinity,
            },
        );
    }, [lyric, needReCalc]);

    useEffect(() => {
        setHighLight(trackedLine.currentIndex);
    }, [trackedLine.currentIndex]);

    const ref = useRef(trackedLine);

    ref.current = trackedLine;

    useEffect(() => {
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

            const { currentTime, nextTime } = ref.current;

            if (time > currentTime && time < nextTime) {
                return;
            } else {
                setNeedReCalc(Symbol());
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
                index: selectedLine,
                time: audioRef.currentTime,
            },
        });
        setSelectLine(guard(selectedLine + 1));
    }, [selectedLine]);

    useEffect(() => {
        const deleteTimeTag = () => {
            lrcDispatch({
                type: LrcActionType.set_time,
                payload: {
                    index: selectedLine,
                    time: undefined,
                },
            });
        };

        const listener = (ev: KeyboardEvent) => {
            const { code, key, target } = ev;

            if (
                ["text", "textarea", "url"].includes((target as any)
                    .type as string)
            ) {
                return;
            }

            if (
                code === "Backspace" ||
                code === "Delete" ||
                key === "Backspace" ||
                key === "Delete" ||
                key === "Del"
            ) {
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

                setSelectLine(guard(selectedLine - 1));
            } else if (
                ["ArrowDown", "KeyS", "KeyK"].includes(code) ||
                ["ArrowDown", "Down", "S", "s", "K", "k"].includes(key)
            ) {
                ev.preventDefault();

                setSelectLine(guard(selectedLine + 1));
            } else if (code === "Home" || key === "Home") {
                ev.preventDefault();

                setSelectLine(0);
            } else if (code === "End" || key === "End") {
                ev.preventDefault();

                setSelectLine(lyric.length - 1);
            } else if (code === "PageUp" || key === "PageUp") {
                ev.preventDefault();

                setSelectLine(guard(selectedLine - 10));
            } else if (code === "PageDown" || key === "PageDown") {
                ev.preventDefault();

                setSelectLine(guard(selectedLine + 10));
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);

            cachedState.selectedLine = selectedLine;
        };
    }, [selectedLine]);

    const onLineClick = useCallback(
        (ev: React.MouseEvent<HTMLUListElement & HTMLLIElement>) => {
            ev.stopPropagation();

            if ((ev.target as any).classList.contains("line")) {
                const lineKey =
                    Number.parseInt(
                        (ev.target as HTMLElement).dataset.key!,
                        10,
                    ) || 0;

                setSelectLine(lineKey);
            }
        },
        [],
    );

    const onLineDoubleClick = useCallback(
        (ev: React.MouseEvent<HTMLUListElement | HTMLLIElement>) => {
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
        },
        [],
    );

    const formatTimeTag = useCallback(
        (time?: number) => {
            return convertTimeToTag(time, prefState.fixed);
        },
        [prefState.fixed],
    );
    const curser = useRef(
        <Curser
            key="curser"
            converter={formatTimeTag}
            fixed={prefState.fixed}
        />,
    );

    const lrcStateRef = useRef(lrcState);
    lrcStateRef.current = lrcState;

    const createDownloadFile = useCallback(() => {
        return stringify(lrcStateRef.current, prefState);
    }, [prefState]);

    return (
        <>
            <ul
                ref={ul}
                className={`lyric-list ${
                    prefState.screenButton ? "on-screen-button" : ""
                }`}
                onClickCapture={onLineClick}
                onDoubleClickCapture={onLineDoubleClick}>
                {lyric.map((line, index) => {
                    const className = ["line"];

                    let insertCurser: JSX.Element | null = null;

                    if (index === selectedLine) {
                        className.push("select");
                        insertCurser = curser.current;
                    }

                    if (index === highLight) {
                        className.push("highlight");
                    }

                    // (1 < undefined)         === false
                    // (undefined < 1)         === false
                    // (undefined < undefined) === false
                    if (
                        index > 0 &&
                        // lyric[index].time !== undefined &&
                        // lyric[index - 1].time !== undefined &&
                        lyric[index].time! <= lyric[index - 1].time!
                    ) {
                        className.push("error");
                    }

                    return (
                        <li
                            key={index}
                            data-key={index}
                            className={className.join(" ")}>
                            {insertCurser}
                            <time className="line-time">
                                {formatTimeTag(line.time)}
                            </time>
                            <span className="line-text">
                                {formatText(
                                    line.text,
                                    prefState.spaceStart,
                                    prefState.spaceEnd,
                                )}
                            </span>
                        </li>
                    );
                })}
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
