import { Action, ActionType, guard, IState } from "../hooks/useLrc.js";
import { State as PrefState } from "../hooks/usePref.js";
import { convertTimeToTag, formatText, ILyric } from "../lrc-parser.js";
import { audioRef, currentTimePubSub } from "../utils/audiomodule.js";
import { isKeyboardElement } from "../utils/is-keyboard-element.js";
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

interface ISynchronizerProps {
    state: IState;
    dispatch: React.Dispatch<Action>;
}

export const Synchronizer: React.FC<ISynchronizerProps> = ({ state, dispatch }) => {
    const self = useRef(Symbol(Synchronizer.name));

    const { selectIndex, currentIndex: highlightIndex } = state;

    const { prefState, lang } = useContext(appContext);

    useEffect(() => {
        dispatch({
            type: ActionType.info,
            payload: {
                name: "tool",
                value: `${lang.app.name} https://lrc-maker.github.io`,
            },
        });
    }, [dispatch, lang]);

    const [syncMode, setSyncMode] = useState(() =>
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
        const line = ul.current?.children[needScrollLine];
        if (line !== undefined) {
            line.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    }, [needScrollLine]);

    useEffect(() => {
        return currentTimePubSub.sub(self.current, (time) => {
            dispatch({ type: ActionType.refresh, payload: time });
        });
    }, [dispatch]);

    const sync = useCallback(() => {
        if (!audioRef.duration) {
            return;
        }

        dispatch({
            type: ActionType.sync,
            payload: audioRef.currentTime,
        });
    }, [dispatch]);

    useEffect(() => {
        const listener = (ev: KeyboardEvent): void => {
            const { code, key, target } = ev;

            const codeOrKey = code || key;

            if (isKeyboardElement(target)) {
                return;
            }

            if (codeOrKey === "Backspace" || codeOrKey === "Delete" || codeOrKey === "Del") {
                ev.preventDefault();
                dispatch({
                    type: ActionType.deleteTime,
                    payload: undefined,
                });
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

                dispatch({ type: ActionType.select, payload: (index) => index - 1 });
            } else if (["ArrowDown", "KeyS", "KeyK", "Down", "S", "s", "K", "k"].includes(codeOrKey)) {
                ev.preventDefault();

                dispatch({ type: ActionType.select, payload: (index) => index + 1 });
            } else if (codeOrKey === "Home") {
                ev.preventDefault();

                dispatch({ type: ActionType.select, payload: () => 0 });
            } else if (codeOrKey === "End") {
                ev.preventDefault();

                dispatch({ type: ActionType.select, payload: () => Infinity });
            } else if (codeOrKey === "PageUp") {
                ev.preventDefault();

                dispatch({ type: ActionType.select, payload: (index) => index - 10 });
            } else if (codeOrKey === "PageDown") {
                ev.preventDefault();

                dispatch({ type: ActionType.select, payload: (index) => index + 10 });
            }
        };

        document.addEventListener("keydown", listener);

        return (): void => {
            document.removeEventListener("keydown", listener);
        };
    }, [dispatch, sync]);

    const onLineClick = useCallback(
        (ev: React.MouseEvent<HTMLUListElement & HTMLLIElement>) => {
            ev.stopPropagation();

            const target = ev.target as HTMLElement;

            if (target.classList.contains("line")) {
                const lineKey = Number.parseInt(target.dataset.key!, 10) || 0;

                dispatch({ type: ActionType.select, payload: () => lineKey });
            }
        },
        [dispatch],
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

                dispatch({
                    type: ActionType.getState,
                    payload: ({ lyric }) => {
                        const time = lyric[key].time;
                        if (time !== undefined) {
                            audioRef.currentTime = guard(time, 0, audioRef.duration);
                        }
                    },
                });
            }
        },
        [dispatch],
    );

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
                .reduce((p, [name, value]) => {
                    if (value) {
                        p.push(name);
                    }
                    return p;
                }, [] as string[])
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
                {state.lyric.map(LyricLineIter)}
            </ul>
            <AsidePanel syncMode={syncMode} setSyncMode={setSyncMode} lrcDispatch={dispatch} prefState={prefState} />
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
