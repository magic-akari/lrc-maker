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
    const toggleSyncMode = useCallback(() => {
        setSyncMode(
            syncMode === SyncMode.select ? SyncMode.highlight : SyncMode.select,
        );
    }, [syncMode]);
    const onDownloadClick = useCallback(() => {
        if (href) {
            URL.revokeObjectURL(href);
        }
        const url = URL.createObjectURL(
            new Blob([createDownloadFile()], {
                type: "text/plain;charset=UTF-8",
            }),
        );
        setHref(url);
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
    return (
        <aside className="aside-panel">
            <button
                className={
                    "aside-button syncmode-button ripple glow " +
                    (syncMode === SyncMode.select ? "select" : "highlight")
                }
                onClick={toggleSyncMode}>
                <LockSVG />
            </button>
            <a
                href={href}
                download={downloadName}
                className="aside-button ripple glow"
                onClick={onDownloadClick}>
                <DownloadSVG />
            </a>
        </aside>
    );
};
