import { AudioActionType, audioStatePubSub } from "../utils/audiomodule.js";
import { CloseSVG } from "./svg.js";

const { useRef, useEffect, useCallback } = React;

interface ILoadAudioDialogRef extends React.RefObject<HTMLDetailsElement> {
    open: () => void;
    close: () => void;
}

// let supportDialog = (window as any).HTMLDialogElement !== undefined;

export const loadAudioDialogRef: ILoadAudioDialogRef = {
    current: null,

    open() {
        if (this.current === null || this.current.open) {
            return;
        }

        this.current.open = true;
    },
    close() {
        if (this.current === null || !this.current.open) {
            return;
        }
        this.current.open = false;
    },
};

interface ILoadAudioOptions {
    setAudioSrc: (src: string) => void;
    lang: Language;
}

export const LoadAudio: React.FC<ILoadAudioOptions> = ({ setAudioSrc, lang }) => {
    const self = useRef(Symbol(LoadAudio.name));

    useEffect(() => {
        audioStatePubSub.sub(self.current, (data) => {
            if (data.type === AudioActionType.getDuration) {
                loadAudioDialogRef.close();
            }
        });
        return () => {
            audioStatePubSub.unsub(self.current);
        };
    }, []);

    useEffect(() => {
        const handleEscape = (ev: KeyboardEvent) => {
            if (ev.code === "Escape" || ev.key === "Escape") {
                loadAudioDialogRef.close();
            }
        };

        const handleToggle = () => {
            if (loadAudioDialogRef.current!.open) {
                window.addEventListener("keydown", handleEscape, {
                    once: true,
                });
            } else {
                window.removeEventListener("keydown", handleEscape);
            }
        };

        loadAudioDialogRef.current!.addEventListener("toggle", handleToggle);

        return () => {
            loadAudioDialogRef.current!.removeEventListener("toggle", handleToggle);
        };
    }, []);

    const onSubmit = useCallback((ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();

        const form = ev.target as HTMLFormElement;

        const urlInput = form.elements.namedItem("url")! as HTMLInputElement;

        let url = urlInput.value;

        if (url.includes("music.163.com")) {
            const result = url.match(/\d{4,}/);
            if (result !== null) {
                const id = result[0];
                url = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
            }
        }

        sessionStorage.setItem(SSK.audioSrc, url);
        setAudioSrc(url);
    }, []);

    return ReactDOM.createPortal(
        <details ref={loadAudioDialogRef} className="dialog fixed loadaudio-dialog">
            <summary className="dialog-close">
                <CloseSVG />
            </summary>
            <section className="dialog-body loadaudio-body">
                <div className="loadaudio-tab loadaudio-via-file">
                    <input type="radio" name="tabgroup" id="tab-file" defaultChecked={true} />
                    <label className="ripple" htmlFor="tab-file">
                        {lang.loadAudio.file}
                    </label>
                    <div className="loadaudio-content">
                        <label className="audio-input-tip" htmlFor="audio-input">
                            {lang.loadAudio.loadFile}
                        </label>
                    </div>
                </div>

                <div className="loadaudio-tab loadaudio-via-url">
                    <input type="radio" name="tabgroup" id="tab-url" />
                    <label className="ripple" htmlFor="tab-url">
                        {lang.loadAudio.url}
                    </label>
                    <div className="loadaudio-content">
                        <form className="audio-input-form" onSubmit={onSubmit}>
                            <input
                                type="url"
                                name="url"
                                required={true}
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                            />
                            <input className="button" type="submit" />
                        </form>
                    </div>
                </div>
            </section>
        </details>,
        document.body,
    );
};
