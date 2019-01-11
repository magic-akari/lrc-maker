import { State as PrefState } from "../hooks/usePref.js";
import { LrcAudio } from "./audio.js";
import { LoadAudio } from "./loadaudio.js";
import { toastPubSub } from "./toast.js";

const { useEffect, useCallback } = React;

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

            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                worker.postMessage(fileReader.result, [
                    fileReader.result as ArrayBuffer,
                ]);
            });
            fileReader.readAsArrayBuffer(file);

            return;
        }
    }
};

interface IFooterProps {
    prefState: PrefState;
    setAudioSrc: TsetAudioSrc;
}

export const Footer: React.FC<IFooterProps> = ({
    prefState,
    setAudioSrc,
    children,
}) => {
    console.info("Footer.render");

    useEffect(() => {
        document.body.addEventListener("drop", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const file = ev.dataTransfer!.files[0];
            receiveFile(file, setAudioSrc);

            return false;
        });

        return () => {
            console.error("Footer should never unmount.");
        };
    }, []);

    const onAudioInputChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            const file = ev.target.files![0];
            receiveFile(file, setAudioSrc);
        },
        [],
    );

    return (
        <footer className="app-footer">
            <input
                id="audio-input"
                type="file"
                accept="audio/*, .ncm"
                hidden={true}
                onChange={onAudioInputChange}
            />
            <LoadAudio setAudioSrc={setAudioSrc} />
            {children}
            {prefState.builtInAudio || <LrcAudio />}
        </footer>
    );
};
