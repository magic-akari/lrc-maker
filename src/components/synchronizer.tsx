import { useHighlight } from "../hooks/useHighlight.js";
import { Action as LrcAction, ActionType as LrcActionType } from "../hooks/useLrc.js";
import { State as PrefState } from "../hooks/usePref.js";
import { convertTimeToTag, formatText, ILyric, State as LrcState } from "../lrc-parser.js";
import { audioRef, currentTimePubSub } from "../utils/audiomodule.js";
import { appContext } from "./app.context.js";
import { AsidePanel } from "./asidepanel.js";
import { Curser } from "./curser.js";

const { useCallback, useContext, useEffect, useRef, useState } = React;

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
    selectIndex: 0,
    highlightIndex: 0,
};

interface ISynchronizerProps {
    lrcState: LrcState;
    lrcDispatch: React.Dispatch<LrcAction>;
}

export const Synchronizer: React.FC<ISynchronizerProps> = ({ lrcState, lrcDispatch }) => {
    const self = useRef(Symbol(Synchronizer.name));

    const { prefState, lang } = useContext(appContext);

    useEffect(() => {
        lrcDispatch({
            type: LrcActionType.set_info,
            payload: {
                name: "tool",
                value: `${lang.app.name} https://lrc-maker.github.io`,
            },
        });
    }, [lang]);

    const lyric = lrcState.lyric;

    const lrcStateRef = useRef(lrcState);
    lrcStateRef.current = lrcState;

    const guard = useCallback((value: number, min: number = 0, max: number = lrcStateRef.current.lyric.length - 1) => {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }, []);

    const [selectIndex, setSelectIndex] = useState(guard(cachedState.selectIndex));

    const [{ currentIndex: highlightIndex }, setHighlight] = useHighlight({ lyric, time: audioRef.currentTime });

    useEffect(() => {
        cachedState.selectIndex = selectIndex;
        cachedState.highlightIndex = highlightIndex;
    }, [selectIndex, highlightIndex]);

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

    useEffect(() => {
        currentTimePubSub.sub(self.current, (time) => setHighlight({ lyric: lrcStateRef.current.lyric, time }));

        return () => {
            currentTimePubSub.unsub(self.current);
        };
    }, []);

    const sync = useCallback(() => {
        if (!audioRef.duration) {
            return;
        }

        let index = 0;
        const time = audioRef.currentTime;

        setSelectIndex((select) => {
            index = select;
            return guard(select + 1);
        });
        lrcDispatch({
            type: LrcActionType.set_time,
            payload: {
                index,
                time,
            },
        });
    }, []);

    useEffect(() => {
        const deleteTimeTag = () => {
            lrcDispatch({
                type: LrcActionType.set_time,
                payload: {
                    index: cachedState.selectIndex,
                    time: undefined,
                },
            });
        };

        const listener = (ev: KeyboardEvent) => {
            const { code, key, target } = ev;

            const codeOrKey = code || key;

            if (["text", "textarea", "url"].includes((target as any).type as string)) {
                return;
            }

            if (codeOrKey === "Backspace" || codeOrKey === "Delete" || codeOrKey === "Del") {
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
            } else if (["ArrowUp", "KeyW", "KeyJ", "Up", "W", "w", "J", "j"].includes(codeOrKey)) {
                ev.preventDefault();

                setSelectIndex((index) => guard(index - 1));
            } else if (["ArrowDown", "KeyS", "KeyK", "Down", "S", "s", "K", "k"].includes(codeOrKey)) {
                ev.preventDefault();

                setSelectIndex((index) => guard(index + 1));
            } else if (codeOrKey === "Home") {
                ev.preventDefault();

                setSelectIndex(0);
            } else if (codeOrKey === "End") {
                ev.preventDefault();

                setSelectIndex(lrcStateRef.current.lyric.length - 1);
            } else if (codeOrKey === "PageUp") {
                ev.preventDefault();

                setSelectIndex((index) => guard(index - 10));
            } else if (codeOrKey === "PageDown") {
                ev.preventDefault();

                setSelectIndex((index) => guard(index + 10));
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, []);

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

            const time = lrcStateRef.current.lyric[key].time;

            if (time !== undefined) {
                audioRef.currentTime = guard(time, 0, audioRef.duration);
            }
        }
    }, []);

    const LyricLineIter = useCallback(
        (line: Readonly<ILyric>, index: number, lines: readonly ILyric[]) => {
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

            return (
                <LyricLine
                    key={index}
                    index={index}
                    className={className}
                    line={line}
                    select={select}
                    prefState={prefState}
                />
            );
        },
        [selectIndex, highlightIndex, prefState],
    );

    const ulClassName = prefState.screenButton ? "lyric-list on-screen-button" : "lyric-list";

    return (
        <>
            <ul ref={ul} className={ulClassName} onClickCapture={onLineClick} onDoubleClickCapture={onLineDoubleClick}>
                {lrcState.lyric.map(LyricLineIter)}
            </ul>
            <AsidePanel syncMode={syncMode} setSyncMode={setSyncMode} lrcStateRef={lrcStateRef} prefState={prefState} />
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
