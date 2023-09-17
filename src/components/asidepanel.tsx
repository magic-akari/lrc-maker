import STRINGS from "#const/strings.json" assert { type: "json" };
import { stringify } from "@lrc-maker/lrc-parser";
import { memo, useCallback, useState } from "react";
import { type Action, ActionType } from "../hooks/useLrc.js";
import { type State as PrefState } from "../hooks/usePref.js";
import { lrcFileName } from "../utils/lrc-file-name.js";
import { DownloadSVG, LockSVG } from "./svg.js";
import { SyncMode } from "./synchronizer.js";

export const AsidePanel: React.FC<{
    syncMode: SyncMode;
    setSyncMode: React.Dispatch<React.SetStateAction<SyncMode>>;
    lrcDispatch: React.Dispatch<Action>;
    prefState: PrefState;
}> = memo(({ syncMode, setSyncMode, lrcDispatch, prefState }) => {
    const [href, setHref] = useState<string>();
    const [name, setName] = useState<string>();

    const onSyncModeToggle = useCallback(() => {
        setSyncMode((syncMode) => (syncMode === SyncMode.select ? SyncMode.highlight : SyncMode.select));
    }, [setSyncMode]);

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

                setName(lrcFileName(state.info));
            },
        });
    }, [lrcDispatch, prefState]);

    const mode = syncMode === SyncMode.select ? "select" : "highlight";

    const className = ["aside-button", "syncmode-button", "ripple", "glow ", mode].join(STRINGS.space);

    return (
        <aside className="aside-panel">
            <button className={className} onClick={onSyncModeToggle} aria-label={`${mode} mode`}>
                <LockSVG />
            </button>
            <a href={href} download={name} className="aside-button ripple glow" onClick={onDownloadClick}>
                <DownloadSVG />
            </a>
        </aside>
    );
});

AsidePanel.displayName = AsidePanel.name;
