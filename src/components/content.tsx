import {
    ActionType as LrcActionType,
    convertTimeToTag,
    stringify,
    useLrc,
} from "../hooks/useLrc.js";
import { Action as PrefAction, State as PrefState } from "../hooks/usePref.js";
import { audioRef } from "../utils/audioref.js";
import { AudioActionType, audioStatePubSub } from "./app.js";
import { Eidtor } from "./editor.js";
import { Gist } from "./gist.js";
import { Home } from "./home.js";
import { Preferences } from "./preferences.js";
import { Synchronizer } from "./synchronizer.js";

const { useState, useEffect, useRef, useMemo } = React;

interface IContentProps {
    prefState: PrefState;
    prefDispatch: React.Dispatch<PrefAction>;
    lang: Language;
}

export const Content: React.FC<IContentProps> = ({
    prefState,
    prefDispatch,
    lang,
}) => {
    console.info("Content.render");
    const self = useRef(Symbol(Content.name));

    useEffect(
        () => {
            document.documentElement.style.setProperty(
                "--theme-color",
                prefState.themeColor,
            );
        },
        [prefState.themeColor],
    );

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

    stateRef.current.lrcState = lrcState;
    stateRef.current.prefState = prefState;

    useEffect(() => {
        audioStatePubSub.sub(self.current, (data) => {
            if (data.type === AudioActionType.getDuration) {
                lrcDispatch({
                    type: LrcActionType.set_info,
                    payload: {
                        name: "length",
                        value: convertTimeToTag(
                            data.payload,
                            stateRef.current.prefState.fixed,
                            false,
                        ),
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

                    const onload = () => {
                        lrcDispatch({
                            type: LrcActionType.parse,
                            payload: fileReader.result as string,
                        });
                        if (audioRef.duration) {
                            lrcDispatch({
                                type: LrcActionType.set_info,
                                payload: {
                                    name: "length",
                                    value: convertTimeToTag(
                                        audioRef.duration,
                                        stateRef.current.prefState.fixed,
                                        false,
                                    ),
                                },
                            });
                        }
                        location.hash = Path.editor;
                    };

                    fileReader.addEventListener("load", onload, {
                        once: true,
                    });

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

    const textColor = useMemo(
        () => {
            // https://www.w3.org/TR/WCAG20/#relativeluminancedef
            const luminanace = (...rgb: [number, number, number]) => {
                return rgb
                    .map((v) => v / 255)
                    .map((v) =>
                        v <= 0.03928
                            ? v / 12.92
                            : Math.pow((v + 0.055) / 1.055, 2.4),
                    )
                    .reduce((p, c, i) => {
                        return p + c * [0.2126, 0.7152, 0.0722][i];
                    }, 0);
            };

            // https://www.w3.org/TR/WCAG20/#contrast-ratiodef
            // const contrast = (rgb1, rgb2) => {
            //   const c1 = luminanace(...rgb1) + 0.05;
            //   const c2 = luminanace(...rgb2) + 0.05;
            //   return c1 > c2 ? c1 / c2 : c2 / c1;
            // };

            // c: color ; b: black; w: white;
            // if we need black text
            //
            // (lum(c) + 0.05) / (l(b) + 0.05) > (l(w) + 0.05) / (lum(c) + 0.05);
            // => (lum(c) + 0.05)^2 > (l(b) +0.05) * (l(w) + 0.05) = 1.05 * 0.05 = 0.0525

            const hex2rgb = (hex: string): [number, number, number] => {
                hex = hex.slice(1);
                const value = Number.parseInt(hex, 16);
                // tslint:disable:no-bitwise
                const r = (value >> 0x10) & 0xff;
                const g = (value >> 0x08) & 0xff;
                const b = (value >> 0x00) & 0xff;
                return [r, g, b];
            };

            const lum = luminanace(...hex2rgb(prefState.themeColor));
            const con = lum + 0.05;
            return con * con > 0.0525 ? "text-black" : "text-white";
        },
        [prefState.themeColor],
    );

    return (
        <main className={`app-main ${textColor}`}>
            {(() => {
                switch (path) {
                    case Path.editor: {
                        return (
                            <Eidtor
                                lrcState={lrcState}
                                lrcDispatch={lrcDispatch}
                                prefState={prefState}
                                lang={lang}
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

                    case Path.gist: {
                        return <Gist lrcDispatch={lrcDispatch} />;
                    }

                    case Path.preferences: {
                        return (
                            <Preferences
                                prefState={prefState}
                                prefDispatch={prefDispatch}
                                lang={lang}
                            />
                        );
                    }
                }

                return <Home lang={lang} />;
            })()}
        </main>
    );
};
