import {
    Action as LrcAction,
    ActionType as LrcActionType,
    State as LrcState,
    stringify,
} from "../hooks/useLrc.js";
import { State as PrefState } from "../hooks/usePref.js";
import { CopySVG, DownloadSVG, OpenFileSVG } from "./svg.js";

const { useState, useRef, useEffect, useCallback, useMemo } = React;

const disableCheck = {
    autoCapitalize: "off",
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
};

const useDefaultValue = (
    defaultValue: string,
    ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null),
) => {
    // warning: make sure we always use outter ref or create new one.

    const currentValue = ref.current ? ref.current.value : defaultValue;

    useEffect(
        () => {
            ref.current!.value = defaultValue;
        },
        [defaultValue, currentValue],
    );
    return { ref, defaultValue };
};

export const Eidtor: React.SFC<{
    lrcState: LrcState;
    lrcDispatch: React.Dispatch<LrcAction>;
    prefState: PrefState;
}> = ({ lrcState, lrcDispatch, prefState }) => {
    console.info("Eidtor.render");

    const parse = useCallback((ev: React.FocusEvent<HTMLTextAreaElement>) => {
        lrcDispatch({
            type: LrcActionType.parse,
            payload: ev.target!.value,
        });
    }, []);

    const setInfo = useCallback((ev: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = ev.target!;
        lrcDispatch({
            type: LrcActionType.set_info,
            payload: { name, value },
        });
    }, []);

    const text = stringify(lrcState, prefState);

    const details = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const dc = details.current!;
        const toggle = () => {
            sessionStorage.setItem(SSK.editorDetailsOpen, dc.open.toString());
        };
        dc.addEventListener("toggle", toggle);

        return () => {
            dc.removeEventListener("toggle", toggle);
        };
    }, []);

    const detailsOpened = useMemo(() => {
        return sessionStorage.getItem(SSK.editorDetailsOpen) !== "false";
    }, []);

    const textarea = useRef<any>(null);
    const [href, setHref] = useState<string | undefined>(undefined);

    const onDownloadClick = useCallback(() => {
        if (href) {
            URL.revokeObjectURL(href);
        }
        const url = URL.createObjectURL(
            new Blob([textarea.current!.value], {
                type: "text/plain;charset=UTF-8",
            }),
        );
        setHref(url);
    }, []);

    const onUploadTextFile = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            if (ev.target.files === null || ev.target.files.length === 0) {
                return;
            }

            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                lrcDispatch({
                    type: LrcActionType.parse,
                    payload: fileReader.result as string,
                });
            });
            fileReader.readAsText(ev.target.files![0], "UTF-8");
        },
        [],
    );

    const onCopyClick = useCallback(() => {
        textarea.current.select();
        document.execCommand("copy");
    }, []);

    const downloadName = useMemo(
        () => {
            const list = [];
            const lrcInfo = lrcState.info;
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
        },
        [lrcState.info],
    );

    return (
        <div className="app-editor">
            <details ref={details} open={detailsOpened}>
                <summary>info</summary>
                <section className="app-editor-infobox">
                    <label htmlFor="info-ti">[ti:</label>
                    <input
                        id="info-ti"
                        name="ti"
                        placeholder="title"
                        onBlur={setInfo}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("ti") || "")}
                    />
                    <label htmlFor="info-ti">]</label>
                    <label htmlFor="info-ar">[ar:</label>
                    <input
                        id="info-ar"
                        name="ar"
                        placeholder="artist"
                        onBlur={setInfo}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("ar") || "")}
                    />
                    <label htmlFor="info-ar">]</label>
                    <label htmlFor="info-al">[al:</label>
                    <input
                        id="info-al"
                        name="al"
                        placeholder="album"
                        onBlur={setInfo}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("al") || "")}
                    />
                    <label htmlFor="info-al">]</label>
                </section>
            </details>

            <section className="editor-tools">
                <label className="editor-tools-item ripple">
                    <input
                        hidden
                        type="file"
                        accept="text/*, .txt, .lrc"
                        onChange={onUploadTextFile}
                    />
                    <OpenFileSVG />
                </label>
                <button
                    className="editor-tools-item ripple"
                    onClick={onCopyClick}>
                    <CopySVG />
                </button>
                <a
                    className="editor-tools-item ripple"
                    href={href}
                    onClick={onDownloadClick}
                    download={downloadName}>
                    <DownloadSVG />
                </a>
            </section>

            <textarea
                className="app-textarea"
                onBlur={parse}
                {...disableCheck}
                {...useDefaultValue(text, textarea)}
            />
        </div>
    );
};
