import { DownloadSVG, LockSVG } from "./svg.js";
import { SyncMode } from "./synchronizer.js";

const { useState, useCallback, useMemo } = React;

export const AsidePanel: React.FC<{
    syncMode: SyncMode;
    setSyncMode: React.Dispatch<React.SetStateAction<SyncMode>>;
    lrcInfo: Map<string, string>;
    createDownloadFile: () => string;
}> = ({ syncMode, setSyncMode, lrcInfo, createDownloadFile }) => {
    const [href, setHref] = useState<string | undefined>(undefined);

    const onSyncModeToggle = useCallback(() => {
        setSyncMode(syncMode === SyncMode.select ? SyncMode.highlight : SyncMode.select);
    }, [syncMode]);

    const onDownloadClick = useCallback(() => {
        setHref((url) => {
            if (url) {
                URL.revokeObjectURL(url);
            }

            return URL.createObjectURL(
                new Blob([createDownloadFile()], {
                    type: "text/plain;charset=UTF-8",
                }),
            );
        });
    }, []);

    const downloadName = useMemo(() => {
        const list = [];
        if (lrcInfo.has("ti")) {
            list.push(lrcInfo.get("ti"));
        }
        if (lrcInfo.has("ar")) {
            list.push(lrcInfo.get("ar"));
        }
        if (list.length === 0) {
            if (lrcInfo.has("al")) {
                list.push(lrcInfo.get("al"));
            }
            list.push(new Date().toLocaleString());
        }
        return list.join(" - ") + ".lrc";
    }, [lrcInfo]);

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
};
