import SSK from "#const/session_key.json" assert { type: "json" };
import { useCallback, useEffect, useRef } from "react";
import * as ReactDOM from "react-dom";
import { AudioActionType, audioStatePubSub } from "../utils/audiomodule.js";
import { CloseSVG } from "./svg.js";

interface ILoadAudioDialogRef extends React.RefObject<HTMLDetailsElement> {
    readonly isOpen: boolean;
    open: () => void;
    close: () => void;
}

// let supportDialog = (window as any).HTMLDialogElement !== undefined;

export const loadAudioDialogRef: ILoadAudioDialogRef = {
    current: null,

    get isOpen() {
        return this.current !== null && this.current.open;
    },

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
        return audioStatePubSub.sub(self.current, (data) => {
            if (data.type === AudioActionType.getDuration) {
                loadAudioDialogRef.close();
            }
        });
    }, []);

    const onToggle = useCallback(() => {
        const onEscapeKeyDown = (ev: KeyboardEvent): void => {
            if (ev.code === "Escape" || ev.key === "Escape") {
                loadAudioDialogRef.close();
            }
        };

        if (loadAudioDialogRef.isOpen) {
            window.addEventListener("keydown", onEscapeKeyDown);
        } else {
            window.removeEventListener("keydown", onEscapeKeyDown);
        }
    }, []);

    const onSubmit = useCallback(
        (ev: React.FormEvent<HTMLFormElement>) => {
            ev.preventDefault();

            const form = ev.target as HTMLFormElement;

            const urlInput = form.elements.namedItem("url") as HTMLInputElement;

            const url = nec(urlInput.value);

            sessionStorage.setItem(SSK.audioSrc, url);
            setAudioSrc(url);
        },
        [setAudioSrc],
    );

    const onFocus = useCallback((ev: React.FocusEvent<HTMLInputElement>) => {
        ev.target.select();
    }, []);

    return ReactDOM.createPortal(
        <details ref={loadAudioDialogRef} className="dialog fixed loadaudio-dialog" onToggle={onToggle}>
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
                                autoCapitalize="none"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                onFocus={onFocus}
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

export const nec = (url: string): string => {
    if (url.includes("music.163.com")) {
        const result = /\d{4,}/.exec(url);
        if (result !== null) {
            const id = result[0];
            return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
        }
    }
    return url;
};
