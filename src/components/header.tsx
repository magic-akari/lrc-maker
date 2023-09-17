import ROUTER from "#const/router.json" assert { type: "json" };
import { useContext } from "react";
import { prependHash } from "../utils/router.js";
import { appContext, ChangBits } from "./app.context.js";
import { CloudSVG, EditorSVG, HomeSVG, PreferencesSVG, SynchronizerSVG } from "./svg.js";

export const Header: React.FC = () => {
    const { lang } = useContext(appContext, ChangBits.lang);

    return (
        <header className="app-header">
            <a id={ROUTER.home} className="app-title" title={lang.header.home} href={prependHash(ROUTER.home)}>
                <span className="app-title-text">{lang.app.name}</span>
                <span className="app-title-svg">
                    <HomeSVG />
                </span>
            </a>
            <nav className="app-nav">
                <a id={ROUTER.editor} className="app-tab" title={lang.header.editor} href={prependHash(ROUTER.editor)}>
                    <EditorSVG />
                </a>
                <a
                    id={ROUTER.synchronizer}
                    className="app-tab"
                    title={lang.header.synchronizer}
                    href={prependHash(ROUTER.synchronizer)}
                >
                    <SynchronizerSVG />
                </a>
                <a id={ROUTER.gist} className="app-tab" title={lang.header.gist} href={prependHash(ROUTER.gist)}>
                    <CloudSVG />
                </a>
                <a
                    id={ROUTER.preferences}
                    className="app-tab"
                    title={lang.header.preferences}
                    href={prependHash(ROUTER.preferences)}
                >
                    <PreferencesSVG />
                </a>
            </nav>
        </header>
    );
};
