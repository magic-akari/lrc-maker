import { AudioActionType, audioRef, audioStatePubSub, currentTimePubSub } from "../utils/audiomodule.js";
import { appContext, ChangBits } from "./app.context.js";
import { LrcAudio } from "./audio.js";
import { LoadAudio } from "./loadaudio.js";
import { toastPubSub } from "./toast.js";

const { useCallback, useContext, useEffect, useRef, useState } = React;

export const Footer: React.FC = () => {
    const { prefState, lang } = useContext(appContext, ChangBits.lang | ChangBits.builtInAudio);

    const [audioSrc, privateSetAudioSrc] = useState<string | undefined>(
        sessionStorage.getItem(SSK.audioSrc) || undefined,
    );

    const onAudioSrcSet = useCallback((src: string) => {
        URL.revokeObjectURL(audioRef.src);
        return privateSetAudioSrc(src);
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", (ev) => {
            const { code, key, target } = ev;

            if (["text", "textarea", "url"].includes((target as any).type as string)) {
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
                    const newRate = Math.exp(Math.max(Math.log(rate) - 0.2, -1));

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

    useEffect(() => {
        document.body.addEventListener("drop", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const file = ev.dataTransfer!.files[0];
            receiveFile(file, privateSetAudioSrc);

            return false;
        });
    }, []);

    const onAudioInputChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        const file = ev.target.files![0];
        receiveFile(file, privateSetAudioSrc);
    }, []);

    const rafId = useRef(0);

    const onAudioLoadedMetadata = useCallback(() => {
        cancelAnimationFrame(rafId.current);
        audioStatePubSub.pub({
            type: AudioActionType.getDuration,
            payload: audioRef.duration,
        });
        toastPubSub.pub({
            type: "success",
            text: lang.notify.audioLoaded,
        });
    }, [lang]);

    const syncCurrentTime = useCallback(() => {
        currentTimePubSub.pub(audioRef.currentTime);
        rafId.current = requestAnimationFrame(syncCurrentTime);
    }, []);

    const onAudioPlay = useCallback(() => {
        rafId.current = requestAnimationFrame(syncCurrentTime);
        audioStatePubSub.pub({
            type: AudioActionType.pause,
            payload: false,
        });
    }, []);

    const onAudioPause = useCallback(() => {
        cancelAnimationFrame(rafId.current);
        audioStatePubSub.pub({
            type: AudioActionType.pause,
            payload: true,
        });
    }, []);

    const onAudioEnded = useCallback(() => {
        cancelAnimationFrame(rafId.current);
        audioStatePubSub.pub({
            type: AudioActionType.pause,
            payload: true,
        });
    }, []);

    const onAudioTimeUpdate = useCallback(() => {
        if (audioRef.paused) {
            currentTimePubSub.pub(audioRef.currentTime);
        }
    }, []);

    const onAudioRateChange = useCallback(() => {
        audioStatePubSub.pub({
            type: AudioActionType.rateChange,
            payload: audioRef.playbackRate,
        });
    }, []);

    const onAudioError = useCallback((ev) => {
        toastPubSub.pub({
            type: "warning",
            text: (ev.target as HTMLAudioElement).error!.message,
        });
    }, []);

    return (
        <footer className="app-footer">
            <input id="audio-input" type="file" accept="audio/*, .ncm" hidden={true} onChange={onAudioInputChange} />
            <LoadAudio setAudioSrc={onAudioSrcSet} lang={lang} />
            <audio
                ref={audioRef}
                src={audioSrc}
                controls={prefState.builtInAudio}
                hidden={!prefState.builtInAudio}
                onLoadedMetadata={onAudioLoadedMetadata}
                onPlay={onAudioPlay}
                onPause={onAudioPause}
                onEnded={onAudioEnded}
                onTimeUpdate={onAudioTimeUpdate}
                onRateChange={onAudioRateChange}
                onError={onAudioError}
            />
            {prefState.builtInAudio || <LrcAudio lang={lang} />}
        </footer>
    );
};

type TsetAudioSrc = (src: string) => void;

const receiveFile = (file: File, setAudioSrc: TsetAudioSrc) => {
    sessionStorage.removeItem(SSK.audioSrc);

    if (file) {
        if (file.type.startsWith("audio/")) {
            setAudioSrc(URL.createObjectURL(file));
            return;
        }
        if (file.name.endsWith(".ncm")) {
            const worker = new Worker("./ncmc-worker.js");
            worker.addEventListener(
                "message",
                (ev) => {
                    if (ev.data.type === "url") {
                        const { dataArray, mime } = ev.data;
                        const musicFile = new Blob([dataArray], {
                            type: mime,
                        });

                        setAudioSrc(URL.createObjectURL(musicFile));
                    }
                    if (ev.data.type === "error") {
                        toastPubSub.pub({
                            type: "warning",
                            text: ev.data.data,
                        });
                    }
                },
                { once: true },
            );

            worker.addEventListener(
                "error",
                (ev) => {
                    toastPubSub.pub({
                        type: "warning",
                        text: ev.message,
                    });
                    worker.terminate();
                },
                { once: true },
            );

            worker.postMessage(file);

            return;
        }
    }
};

// side effect
document.addEventListener("visibilitychange", () => {
    if (!audioRef.paused) {
        audioRef.toggle();
    }
});
