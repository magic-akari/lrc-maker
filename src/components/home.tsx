import { appContext } from "./app.context.js";
import { loadAudioDialogRef } from "./loadaudio.js";
import { EditorSVG, LoadAudioSVG, SynchronizerSVG } from "./svg.js";

const { useContext } = React;

export const Home: React.FC = () => {
    const { lang } = useContext(appContext);

    return (
        <div className="home">
            <p className="home-tip home-tip-top-left">{lang.home.tipTopLeft}</p>
            <p className="home-tip home-tip-top-right">
                {lang.home.tipTopRight}
            </p>
            <p className="home-tip home-tip-bottom-left">
                {lang.home.tipBottomLeft}
            </p>
            <p className="home-tip home-tip-bottom-right">
                {lang.home.tipBottomRight}
            </p>
            <section className="home-tip-text">
                <p>{lang.home.tips}</p>
                <ol>
                    <li>
                        <a className="home-tip-text-svg" href={Path.editor}>
                            <EditorSVG />
                        </a>
                        {lang.home.tipForLyricText}
                    </li>
                    <li>
                        <button
                            className="home-tip-text-svg"
                            onClick={() => loadAudioDialogRef.open()}>
                            <LoadAudioSVG />
                        </button>
                        {lang.home.tipForUploadAudio}
                    </li>
                    <li>
                        <a
                            className="home-tip-text-svg"
                            href={Path.synchronizer}>
                            <SynchronizerSVG />
                        </a>
                        {lang.home.tipForSynchronizer}
                    </li>
                </ol>
            </section>
        </div>
    );
};

document.addEventListener("keydown", (ev) => {
    const { code, key, target } = ev;

    if (["text", "textarea", "url"].includes((target as any).type as string)) {
        return;
    }

    if (key === "?" || (code === "Slash" && ev.shiftKey)) {
        location.hash = Path.home;
    }
});
