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
