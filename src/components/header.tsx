import {
    CloudSVG,
    EditorSVG,
    HomeSVG,
    PreferencesSVG,
    SynchronizerSVG,
} from "./svg.js";

export const Header: React.FC<{ lang: Language }> = ({ lang }) => {
    console.info("Header.render");

    return (
        <header className="app-header">
            <a
                id={Path.homeID}
                className="app-title"
                title={lang.header.home}
                href={Path.home}>
                <span className="app-title-text">{lang.app.name}</span>
                <span className="app-title-svg">
                    <HomeSVG />
                </span>
            </a>
            <nav className="app-nav">
                <a
                    id={Path.editorID}
                    className="app-tab"
                    title={lang.header.editor}
                    href={Path.editor}>
                    <EditorSVG />
                </a>
                <a
                    id={Path.synchronizerID}
                    className="app-tab"
                    title={lang.header.synchronizer}
                    href={Path.synchronizer}>
                    <SynchronizerSVG />
                </a>
                <a
                    id={Path.gistID}
                    className="app-tab"
                    title={lang.header.gist}
                    href={Path.gist}>
                    <CloudSVG />
                </a>
                <a
                    id={Path.preferencesID}
                    className="app-tab"
                    title={lang.header.preferences}
                    href={Path.preferences}>
                    <PreferencesSVG />
                </a>
            </nav>
        </header>
    );
};
