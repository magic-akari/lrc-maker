import ROUTER from "#const/router.json" assert { type: "json" };
import { useContext } from "react";
import { isKeyboardElement } from "../utils/is-keyboard-element.js";
import { prependHash } from "../utils/router.js";
import { appContext } from "./app.context.js";
import { loadAudioDialogRef } from "./loadaudio.js";
import { EditorSVG, LoadAudioSVG, SynchronizerSVG } from "./svg.js";

export const Home: React.FC = () => {
    const { lang } = useContext(appContext);

    const onLoadAudioDialogOpen = (): void => {
        loadAudioDialogRef.open();
    };

    return (
        <div className="home">
            <p className="home-tip home-tip-top-left">{lang.home.tipTopLeft}</p>
            <p className="home-tip home-tip-top-right">{lang.home.tipTopRight}</p>
            <p className="home-tip home-tip-bottom-left">{lang.home.tipBottomLeft}</p>
            <p className="home-tip home-tip-bottom-right">{lang.home.tipBottomRight}</p>
            <section className="home-tip-section">
                <p>{lang.home.tips}</p>
                <ol>
                    <li>
                        <a className="home-tip-item" href={prependHash(ROUTER.editor)}>
                            <EditorSVG />
                            <span className="home-tip-text">{lang.home.tipForLyricText}</span>
                        </a>
                    </li>
                    <li>
                        <span className="home-tip-item" onClick={onLoadAudioDialogOpen}>
                            <LoadAudioSVG />
                            <span className="home-tip-text">{lang.home.tipForUploadAudio}</span>
                        </span>
                    </li>
                    <li>
                        <a className="home-tip-item" href={prependHash(ROUTER.synchronizer)}>
                            <SynchronizerSVG />
                            <span className="home-tip-text">{lang.home.tipForSynchronizer}</span>
                        </a>
                    </li>
                </ol>
            </section>
        </div>
    );
};

document.addEventListener("keydown", (ev) => {
    const { code, key, target } = ev;

    if (isKeyboardElement(target)) {
        return;
    }

    if (key === "?" || (code === "Slash" && ev.shiftKey)) {
        location.hash = ROUTER.home;
    }
});
