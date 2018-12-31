import { EditorSVG, PreferencesSVG, SynchronizerSVG } from "./svg.js";

export const Header: React.FC<{ lang: Language }> = ({ lang }) => {
    console.info("Header.render");

    return (
        <header className="app-header">
            <a href={Path.home} id={Path.homeID} className="app-title">
                {lang.app.name}
            </a>
            <nav className="app-nav">
                <a href={Path.editor} id={Path.editorID}>
                    <EditorSVG />
                </a>
                <a href={Path.synchronizer} id={Path.synchronizerID}>
                    <SynchronizerSVG />
                </a>
                <a href={Path.preferences} id={Path.preferencesID}>
                    <PreferencesSVG />
                </a>
            </nav>
        </header>
    );
};
