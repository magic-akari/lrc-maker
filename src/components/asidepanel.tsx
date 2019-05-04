import { Action, ActionType } from "../hooks/useLrc.js";
import { State as PrefState } from "../hooks/usePref.js";
import { stringify } from "../lrc-parser.js";
import { DownloadSVG, LockSVG } from "./svg.js";
import { SyncMode } from "./synchronizer.js";

const { useState, useCallback } = React;

export const AsidePanel: React.FC<{
    syncMode: SyncMode;
    setSyncMode: React.Dispatch<React.SetStateAction<SyncMode>>;
    lrcDispatch: React.Dispatch<Action>;
    prefState: PrefState;
}> = React.memo(({ syncMode, setSyncMode, lrcDispatch, prefState }) => {
    const [href, setHref] = useState<string>();
    const [name, setName] = useState<string>();

    const onSyncModeToggle = useCallback(() => {
        setSyncMode(syncMode === SyncMode.select ? SyncMode.highlight : SyncMode.select);
    }, [syncMode]);

    const onDownloadClick = useCallback(() => {
        lrcDispatch({
            type: ActionType.getState,
            payload: (state) => {
                const text = stringify(state, prefState);
                setHref((url) => {
                    if (url) {
                        URL.revokeObjectURL(url);
                    }

                    return URL.createObjectURL(
                        new Blob([text], {
                            type: "text/plain;charset=UTF-8",
                        }),
                    );
                });

                const info = state.info;
                const list = [];
                if (info.has("ti")) {
                    list.push(info.get("ti"));
                }
                if (info.has("ar")) {
                    list.push(info.get("ar"));
                }
                if (list.length === 0) {
                    if (info.has("al")) {
                        list.push(info.get("al"));
                    }
                    list.push(new Date().toLocaleString());
                }
                setName(list.join(" - ") + ".lrc");
            },
        });
    }, [prefState]);

    const className = [
        "aside-button",
        "syncmode-button",
        "ripple",
        "glow ",
        syncMode === SyncMode.select ? "select" : "highlight",
    ].join(Const.space);

    return (
        <aside className="aside-panel">
            <button className={className} onClick={onSyncModeToggle}>
                <LockSVG />
            </button>
            <a href={href} download={name} className="aside-button ripple glow" onClick={onDownloadClick}>
                <DownloadSVG />
            </a>
        </aside>
    );
});
