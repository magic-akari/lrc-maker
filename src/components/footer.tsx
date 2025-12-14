import SSK from "#const/session_key.json" assert { type: "json" };
import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { useKeyBindings } from "../hooks/useKeyBindings.js";
import { AudioActionType, audioRef, audioStatePubSub, currentTimePubSub } from "../utils/audiomodule.js";
import { InputAction } from "../utils/input-action.js";
import { isKeyboardElement } from "../utils/is-keyboard-element.js";
import { getMatchedAction } from "../utils/keybindings.js";
import { appContext, ChangBits } from "./app.context.js";
import { LrcAudio } from "./audio.js";
import { LoadAudio, nec } from "./loadaudio.js";
import { toastPubSub } from "./toast.js";

const accept = ["audio/*", ".ncm", ".qmcflac", ".qmc0", ".qmc1", ".qmc2", ".qmc3", "qmcogg"].join(", ");

export const Footer: React.FC = () => {
    const { prefState, lang } = useContext(appContext, ChangBits.lang | ChangBits.builtInAudio);
    const keyBindings = useKeyBindings();

    const [audioSrc, setAudioSrc] = useReducer(
        (oldSrc: string, newSrc: string) => {
            URL.revokeObjectURL(oldSrc);
            return newSrc;
        },
        undefined,
        () => {
            let src = sessionStorage.getItem(SSK.audioSrc);
            if (src === null && location.search && URLSearchParams) {
                const searchParams = new URLSearchParams(location.search);
                const url = searchParams.get("url");
                if (url !== null) {
                    return url;
                }
                const text = searchParams.get("text") || searchParams.get("title") || "";
                const result = /https?:\/\/\S+/.exec(text);
                src = result && nec(result[0]);
            }
            return src!;
        },
    );

    useEffect(() => {
        function onKeydown(ev: KeyboardEvent) {
            if (isKeyboardElement(ev.target)) {
                return;
            }

            if (!audioRef.src) {
                return;
            }

            const action = getMatchedAction(ev, keyBindings);

            switch (action) {
                case InputAction.SeekBackward:
                    ev.preventDefault();
                    audioRef.step(ev, -5);
                    break;
                case InputAction.SeekForward:
                    ev.preventDefault();
                    audioRef.step(ev, 5);
                    break;
                case InputAction.ResetRate:
                    ev.preventDefault();
                    audioRef.playbackRate = 1;
                    break;
                case InputAction.IncreaseRate: {
                    ev.preventDefault();
                    const rate = audioRef.playbackRate;
                    audioRef.playbackRate = Math.exp(Math.min(Math.log(rate) + 0.2, 1));
                    break;
                }
                case InputAction.DecreaseRate: {
                    ev.preventDefault();
                    const rate = audioRef.playbackRate;
                    audioRef.playbackRate = Math.exp(Math.max(Math.log(rate) - 0.2, -1));
                    break;
                }
                case InputAction.TogglePlay:
                    ev.preventDefault();
                    audioRef.toggle();
                    break;
            }
        }
        document.addEventListener("keydown", onKeydown);

        return () => document.removeEventListener("keydown", onKeydown);
    }, [keyBindings]);

    useEffect(() => {
        function onDrop(ev: DragEvent) {
            const file = ev.dataTransfer!.files[0];
            receiveFile(file, setAudioSrc);
        }

        document.documentElement.addEventListener("drop", onDrop);

        return () => document.documentElement.removeEventListener("drop", onDrop);
    }, []);

    const onAudioInputChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        const file = ev.target.files![0];
        receiveFile(file, setAudioSrc);
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
    }, [syncCurrentTime]);

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

    const onAudioError = useCallback(
        (ev: React.SyntheticEvent<HTMLAudioElement>) => {
            const audio = ev.target as HTMLAudioElement;
            const error = audio.error!;
            const message = lang.audio.error[error.code] || error.message || lang.audio.error[0];
            toastPubSub.pub({
                type: "warning",
                text: message,
            });
        },
        [lang],
    );

    return (
        <footer className="app-footer">
            <input id="audio-input" type="file" accept={accept} hidden={true} onChange={onAudioInputChange} />
            <LoadAudio setAudioSrc={setAudioSrc} lang={lang} />
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

const receiveFile = (file: File, setAudioSrc: TsetAudioSrc): void => {
    sessionStorage.removeItem(SSK.audioSrc);

    if (file) {
        if (file.type.startsWith("audio/")) {
            setAudioSrc(URL.createObjectURL(file));
            return;
        }
        if (file.name.endsWith(".ncm")) {
            const worker = new Worker(new URL("/worker/ncmc-worker.js", import.meta.url));
            worker.addEventListener(
                "message",
                (ev: IMessageEvent<IMessage>) => {
                    if (ev.data.type === "success") {
                        const dataArray = ev.data.payload;
                        const musicFile = new Blob([dataArray], {
                            type: detectMimeType(dataArray),
                        });

                        setAudioSrc(URL.createObjectURL(musicFile));
                    }
                    if (ev.data.type === "error") {
                        toastPubSub.pub({
                            type: "warning",
                            text: ev.data.payload,
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
        if (/\.qmc(?:flac|0|1|2|3)$/.test(file.name)) {
            const worker = new Worker(new URL("/worker/qmc-worker.js", import.meta.url));
            worker.addEventListener(
                "message",
                (ev: IMessageEvent<IMessage>) => {
                    if (ev.data.type === "success") {
                        const dataArray = ev.data.payload;
                        const musicFile = new Blob([dataArray], {
                            type: detectMimeType(dataArray),
                        });

                        setAudioSrc(URL.createObjectURL(musicFile));
                    }
                },
                { once: true },
            );

            worker.postMessage(file);
        }
    }
};

const MimeType = {
    fLaC: 0x664c6143,
    OggS: 0x4f676753,
    RIFF: 0x52494646,
    WAVE: 0x57415645,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const detectMimeType = (dataArray: Uint8Array) => {
    const magicNumber = new DataView(dataArray.buffer).getUint32(0, false);
    switch (magicNumber) {
        case MimeType.fLaC:
            return "audio/flac";

        case MimeType.OggS:
            return "audio/ogg";

        case MimeType.RIFF:
        case MimeType.WAVE:
            return "audio/wav";

        default:
            return "audio/mpeg";
    }
};

// side effect
document.addEventListener("visibilitychange", () => {
    if (!audioRef.paused) {
        audioRef.toggle();
    }
});
