import { loadAudioDialogRef } from "./loadaudio.js";
import { EditorSVG, LoadAudioSVG, SynchronizerSVG } from "./svg.js";

export const Home: React.FC = () => {
    return (
        <div className="home">
            <p className="home-tip home-tip-top-left">
                点击这里可以回到这个帮助页面
            </p>
            <p className="home-tip home-tip-top-right">点击这里切换页面</p>
            <p className="home-tip home-tip-bottom-left">
                这里可以加载音频，控制播放
            </p>
            <p className="home-tip home-tip-bottom-right">
                这里可以调节播放速度
            </p>
            <section className="home-tip-text">
                <p>提示：</p>
                <ol>
                    <li>
                        <a className="home-tip-text-svg" href={Path.editor}>
                            <EditorSVG />
                        </a>
                        {"切换到编辑页面，粘贴歌词文本。"}
                    </li>
                    <li>
                        <button
                            className="home-tip-text-svg"
                            onClick={() => loadAudioDialogRef.showModal()}>
                            <LoadAudioSVG />
                        </button>
                        {"点击左下方按钮，载入音频文件。"}
                    </li>
                    <li>
                        <a
                            className="home-tip-text-svg"
                            href={Path.synchronizer}>
                            <SynchronizerSVG />
                        </a>
                        {"切换到打轴页面，开始制作滚动歌词吧～"}
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
