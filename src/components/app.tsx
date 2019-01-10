import { useLang } from "../hooks/useLang.js";
import { usePref } from "../hooks/usePref.js";
import { audioRef } from "../utils/audioref.js";
import { createPubSub } from "../utils/pubsub.js";
import { Content } from "./content.js";
import { Footer } from "./footer.js";
import { Header } from "./header.js";
import { Toast } from "./toast.js";

const { useState, useEffect, useRef, useCallback } = React;

export const currentTimePubSub = createPubSub<number>();

export const enum AudioActionType {
    pause,
    getDuration,
    rateChange,
}

export type AudioState =
    | {
          type: AudioActionType.pause;
          payload: boolean;
      }
    | {
          type: AudioActionType.getDuration;
          payload: number;
      }
    | {
          type: AudioActionType.rateChange;
          payload: number;
      };

export const audioStatePubSub = createPubSub<AudioState>();

export const App: React.FC = () => {
    console.info("App.render");

    const [prefState, prefDispatch] = usePref(
        localStorage.getItem(LSK.preferences) || Const.emptyString,
    );

    const [lang, setLang] = useLang();

    useEffect(
        () => {
            setLang(prefState.lang);
        },
        [prefState.lang],
    );

    const [audioSrc, setAudioSrc] = useState<string | undefined>(
        sessionStorage.getItem(SSK.audioSrc) || undefined,
    );

    const rafId = useRef(0);

    useEffect(() => {
        (window as any).prefDispatch = prefDispatch;

        const syncCurrentTime = () => {
            currentTimePubSub.pub(audioRef.currentTime);
            rafId.current = requestAnimationFrame(syncCurrentTime);
        };

        const ac = audioRef.current!;

        const passive = { passive: true };

        ac.addEventListener(
            "loadedmetadata",
            () => {
                cancelAnimationFrame(rafId.current);
                audioStatePubSub.pub({
                    type: AudioActionType.getDuration,
                    payload: audioRef.duration,
                });
            },
            passive,
        );

        ac.addEventListener(
            "play",
            () => {
                rafId.current = requestAnimationFrame(syncCurrentTime);
                audioStatePubSub.pub({
                    type: AudioActionType.pause,
                    payload: false,
                });
            },
            passive,
        );

        ac.addEventListener(
            "timeupdate",
            () => {
                if (ac.paused) {
                    currentTimePubSub.pub(audioRef.currentTime);
                }
            },
            passive,
        );

        ac.addEventListener(
            "pause",
            () => {
                cancelAnimationFrame(rafId.current);
                audioStatePubSub.pub({
                    type: AudioActionType.pause,
                    payload: true,
                });
            },
            passive,
        );

        ac.addEventListener(
            "ended",
            () => {
                cancelAnimationFrame(rafId.current);
                audioStatePubSub.pub({
                    type: AudioActionType.pause,
                    payload: true,
                });
            },
            passive,
        );

        ac.addEventListener(
            "ratechange",
            () => {
                audioStatePubSub.pub({
                    type: AudioActionType.rateChange,
                    payload: ac.playbackRate,
                });
            },
            passive,
        );
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", (ev) => {
            const { code, key, target } = ev;

            if (
                ["text", "textarea", "url"].includes((target as any)
                    .type as string)
            ) {
                return;
            }

            const ac = audioRef.current!;

            if (!ac.src) {
                return;
            }

            if (ev.metaKey === true || ev.ctrlKey === true) {
                if (
                    code === "ArrowUp" ||
                    code === "KeyJ" ||
                    key === "ArrowUp" ||
                    key === "Up" ||
                    key === "J" ||
                    key === "j"
                ) {
                    ev.preventDefault();

                    const rate = ac.playbackRate;
                    const newRate = Math.exp(Math.min(Math.log(rate) + 0.2, 1));

                    ac.playbackRate = newRate;
                } else if (
                    code === "ArrowDown" ||
                    code === "KeyK" ||
                    key === "ArrowDown" ||
                    key === "Down" ||
                    key === "K" ||
                    key === "k"
                ) {
                    ev.preventDefault();

                    const rate = ac.playbackRate;
                    const newRate = Math.exp(
                        Math.max(Math.log(rate) - 0.2, -1),
                    );

                    ac.playbackRate = newRate;
                } else if (code === "Enter" || key === "Enter") {
                    ev.preventDefault();
                    audioRef.toggle();
                }
            } else {
                if (
                    code === "ArrowLeft" ||
                    code === "KeyA" ||
                    key === "ArrowLeft" ||
                    key === "Left" ||
                    key === "A" ||
                    key === "a"
                ) {
                    ev.preventDefault();

                    ac.currentTime -= 5;
                } else if (
                    code === "ArrowRight" ||
                    code === "KeyD" ||
                    key === "ArrowRight" ||
                    key === "Right" ||
                    key === "D" ||
                    key === "d"
                ) {
                    ev.preventDefault();

                    ac.currentTime += 5;
                } else if (code === "KeyR" || key === "R" || key === "r") {
                    ev.preventDefault();

                    ac.playbackRate = 1;
                }
            }
        });
    }, []);

    const refreshAudioSrc = useCallback((src: string) => {
        URL.revokeObjectURL(audioRef.src);
        return setAudioSrc(src);
    }, []);

    useEffect(() => {
        return () => {
            console.error("App component never unmount.");
        };
    }, []);

    return (
        <>
            <Header lang={lang} />
            <Content prefState={prefState} prefDispatch={prefDispatch} />
            <Footer prefState={prefState} setAudioSrc={refreshAudioSrc}>
                <audio
                    ref={audioRef}
                    src={audioSrc}
                    controls={prefState.builtInAudio}
                    hidden={!prefState.builtInAudio}
                />
            </Footer>
            <Toast />
        </>
    );
};

// side effect
document.addEventListener("visibilitychange", () => {
    if (!audioRef.paused) {
        audioRef.toggle();
    }
});

ReactDOM.render(
    React.createElement(App),
    document.querySelector(".app-container"),
);
