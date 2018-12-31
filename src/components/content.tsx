import {
    ActionType as LrcActionType,
    convertTimeToTag,
    getFormatter,
    stringify,
    useLrc,
} from "../hooks/useLrc.js";
import { Action as PrefAction, State as PrefState } from "../hooks/usePref.js";
import { AudioActionType, audioStatePubSub } from "./app.js";
import { Eidtor } from "./editor.js";
import { Home } from "./home.js";
import { Preferences } from "./preferences.js";
import { Synchronizer } from "./synchronizer.js";

const { useState, useEffect, useRef } = React;

interface IContentProps {
    prefState: PrefState;
    prefDispatch: React.Dispatch<PrefAction>;
}

export const Content: React.FC<IContentProps> = ({
    prefState,
    prefDispatch,
}) => {
    console.info("Content.render");
    const self = useRef(Symbol(Content.name));

    const [path, setPath] = useState(location.hash);
    useEffect(() => {
        addEventListener("hashchange", () => {
            setPath(location.hash);
        });
    }, []);

    const [lrcState, lrcDispatch] = useLrc(
        localStorage.getItem(LSK.lyric) || Const.emptyString,
    );

    const stateRef = useRef({ lrcState, prefState });

    stateRef.current = { lrcState, prefState };

    useEffect(() => {
        audioStatePubSub.sub(self.current, (data) => {
            if (data.type === AudioActionType.getDuration) {
                const formatter = getFormatter(
                    stateRef.current.prefState.fixed,
                );

                lrcDispatch({
                    type: LrcActionType.set_info,
                    payload: {
                        name: "length",
                        value: convertTimeToTag(data.payload, formatter, false),
                    },
                });
            }
        });

        return () => {
            audioStatePubSub.unsub(self.current);
        };
    }, []);

    useEffect(() => {
        const saveState = () => {
            // tslint:disable-next-line:no-shadowed-variable
            const { lrcState, prefState } = stateRef.current;

            localStorage.setItem(LSK.lyric, stringify(lrcState, prefState));

            localStorage.setItem(LSK.preferences, JSON.stringify(prefState));
        };

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                saveState();
            }
        });

        window.addEventListener("beforeunload", () => {
            saveState();
        });
    }, []);

    useEffect(() => {
        document.body.addEventListener("dragover", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            ev.dataTransfer!.dropEffect = "copy";
            return false;
        });

        document.body.addEventListener("drop", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const file = ev.dataTransfer!.files[0];
            if (file) {
                if (
                    file.type.startsWith("text/") ||
                    /(?:\.lrc|\.txt)$/i.test(file.name)
                ) {
                    const fileReader = new FileReader();

                    fileReader.addEventListener(
                        "load",
                        () => {
                            lrcDispatch({
                                type: LrcActionType.parse,
                                payload: fileReader.result as string,
                            });
                        },
                        {
                            once: true,
                        },
                    );

                    fileReader.readAsText(file, "utf-8");
                }
            }
            return false;
        });
    }, []);

    useEffect(() => {
        return () => {
            console.error("Content component never unmount");
        };
    }, []);

    return (
        <main className="app-main">
            {(() => {
                switch (path) {
                    case Path.editor: {
                        return (
                            <Eidtor
                                lrcState={lrcState}
                                lrcDispatch={lrcDispatch}
                                prefState={prefState}
                            />
                        );
                    }

                    case Path.synchronizer: {
                        return (
                            <Synchronizer
                                lrcState={lrcState}
                                lrcDispatch={lrcDispatch}
                                prefState={prefState}
                            />
                        );
                    }

                    case Path.preferences: {
                        return (
                            <Preferences
                                prefState={prefState}
                                prefDispatch={prefDispatch}
                            />
                        );
                    }
                }

                return <Home />;
            })()}
        </main>
    );
};
