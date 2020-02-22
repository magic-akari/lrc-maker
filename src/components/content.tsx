import { ActionType as LrcActionType, useLrc } from "../hooks/useLrc.js";
import { convertTimeToTag, stringify } from "../lrc-parser.js";
import { AudioActionType, audioStatePubSub } from "../utils/audiomodule.js";
import { appContext, ChangBits } from "./app.context.js";
import { Home } from "./home.js";
import { AkariNotFound, AkariOangoLoading } from "./svg.img.js";

const { lazy, useContext, useEffect, useRef, useState } = React;

const LazyEditor = lazy(() =>
    import(/* webpackMode: "eager" */ "./editor.js").then(({ Eidtor }) => {
        return { default: Eidtor };
    }),
);

const LazySynchronizer = lazy(() =>
    import(/* webpackMode: "eager" */ "./synchronizer.js").then(({ Synchronizer }) => {
        return { default: Synchronizer };
    }),
);

const LazyGist = lazy(() =>
    import(/* webpackMode: "eager" */ "./gist.js").then(({ Gist }) => {
        return { default: Gist };
    }),
);

const LazyPreferences = lazy(() =>
    import(/* webpackMode: "eager" */ "./preferences.js").then(({ Preferences }) => {
        return { default: Preferences };
    }),
);

export const Content: React.FC = () => {
    const self = useRef(Symbol(Content.name));

    const { prefState, trimOptions } = useContext(appContext, ChangBits.prefState);

    const [path, setPath] = useState(location.hash);
    useEffect(() => {
        window.addEventListener("hashchange", () => {
            setPath(location.hash);
        });
    }, []);

    const [lrcState, lrcDispatch] = useLrc(() => {
        return {
            text: localStorage.getItem(LSK.lyric) || Const.emptyString,
            options: trimOptions,
            select: Number.parseInt(sessionStorage.getItem(SSK.selectIndex)!, 10) || 0,
        };
    });

    useEffect(() => {
        return audioStatePubSub.sub(self.current, (data) => {
            if (data.type === AudioActionType.getDuration) {
                lrcDispatch({
                    type: LrcActionType.info,
                    payload: {
                        name: "length",
                        value: convertTimeToTag(data.payload, prefState.fixed, false),
                    },
                });
            }
        });
    }, [lrcDispatch, prefState.fixed]);

    useEffect(() => {
        const saveState = (): void => {
            lrcDispatch({
                type: LrcActionType.getState,
                payload: (lrc) => {
                    localStorage.setItem(LSK.lyric, stringify(lrc, prefState));
                    sessionStorage.setItem(SSK.selectIndex, lrc.selectIndex.toString());
                },
            });

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
    }, [lrcDispatch, prefState]);

    useEffect(() => {
        document.documentElement.addEventListener("drop", (ev) => {
            const file = ev.dataTransfer?.files[0];
            if (file && (file.type.startsWith("text/") || /(?:\.lrc|\.txt)$/i.test(file.name))) {
                const fileReader = new FileReader();

                const onload = (): void => {
                    lrcDispatch({
                        type: LrcActionType.parse,
                        payload: { text: fileReader.result as string, options: trimOptions },
                    });
                };

                fileReader.addEventListener("load", onload, {
                    once: true,
                });

                location.hash = Path.editor;

                fileReader.readAsText(file, "utf-8");
            }
        });
    }, [lrcDispatch, trimOptions]);

    useEffect(() => {
        const rgb = hex2rgb(prefState.themeColor);
        document.documentElement.style.setProperty("--theme-rgb", rgb.join(", "));

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

        const lum = luminanace(...rgb);
        const con = lum + 0.05;
        const contrastColor = con * con > 0.0525 ? "var(--black)" : "var(--white)";
        document.documentElement.style.setProperty("--theme-contrast-color", contrastColor);
    }, [prefState.themeColor]);

    const content = ((): JSX.Element => {
        switch (path) {
            case Path.editor: {
                return <LazyEditor lrcState={lrcState} lrcDispatch={lrcDispatch} />;
            }

            case Path.synchronizer: {
                if (lrcState.lyric.length === 0) {
                    return <AkariNotFound />;
                }
                return <LazySynchronizer state={lrcState} dispatch={lrcDispatch} />;
            }

            case Path.gist: {
                return <LazyGist lrcDispatch={lrcDispatch} langName={prefState.lang} />;
            }

            case Path.preferences: {
                return <LazyPreferences />;
            }
        }

        return <Home />;
    })();

    return (
        <main className="app-main">
            <React.Suspense fallback={<AkariOangoLoading />}>{content}</React.Suspense>
        </main>
    );
};

// https://www.w3.org/TR/WCAG20/#relativeluminancedef
const luminanace = (...rgb: [number, number, number]): number => {
    return rgb
        .map((v) => v / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
        .reduce((p, c, i) => {
            return p + c * [0.2126, 0.7152, 0.0722][i];
        }, 0);
};

const hex2rgb = (hex: string): [number, number, number] => {
    hex = hex.slice(1);
    const value = Number.parseInt(hex, 16);
    const r = (value >> 0x10) & 0xff;
    const g = (value >> 0x08) & 0xff;
    const b = (value >> 0x00) & 0xff;
    return [r, g, b];
};
