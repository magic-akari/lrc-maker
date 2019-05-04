import { State as PrefState } from "../hooks/usePref.js";
import { State as LrcState, stringify } from "../lrc-parser.js";
import { DownloadSVG, LockSVG } from "./svg.js";
import { SyncMode } from "./synchronizer.js";

const { useState, useCallback, useMemo } = React;

export const AsidePanel: React.FC<{
    syncMode: SyncMode;
    setSyncMode: React.Dispatch<React.SetStateAction<SyncMode>>;
    lrcStateRef: { current: LrcState };
    prefState: PrefState;
}> = React.memo(({ syncMode, setSyncMode, lrcStateRef, prefState }) => {
    const [href, setHref] = useState<string>();

    const onSyncModeToggle = useCallback(() => {
        setSyncMode(syncMode === SyncMode.select ? SyncMode.highlight : SyncMode.select);
    }, [syncMode]);

    const onDownloadClick = useCallback(() => {
        setHref((url) => {
            if (url) {
                URL.revokeObjectURL(url);
            }

            return URL.createObjectURL(
                new Blob([stringify(lrcStateRef.current, prefState)], {
                    type: "text/plain;charset=UTF-8",
                }),
            );
        });
    }, []);

    const info = lrcStateRef.current.info;

    const downloadName = useMemo(() => {
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
        return list.join(" - ") + ".lrc";
    }, [info]);

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
            <a href={href} download={downloadName} className="aside-button ripple glow" onClick={onDownloadClick}>
                <DownloadSVG />
            </a>
        </aside>
    );
});
