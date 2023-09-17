import LSK from "#const/local_key.json" assert { type: "json" };
import ROUTER from "#const/router.json" assert { type: "json" };
import SSK from "#const/session_key.json" assert { type: "json" };
import { type State as LrcState, stringify } from "@lrc-maker/lrc-parser";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Action as LrcAction } from "../hooks/useLrc.js";
import { ActionType as LrcActionType } from "../hooks/useLrc.js";
import { createFile } from "../utils/gistapi.js";
import { lrcFileName } from "../utils/lrc-file-name.js";
import { prependHash } from "../utils/router.js";
import { appContext } from "./app.context.js";
import { CloudUploadSVG, CopySVG, DownloadSVG, OpenFileSVG, UtilitySVG } from "./svg.js";
import { toastPubSub } from "./toast.js";

const disableCheck = {
    autoCapitalize: "none",
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
};

type HTMLInputLikeElement = HTMLInputElement & HTMLTextAreaElement;

type UseDefaultValue<T = React.RefObject<HTMLInputLikeElement>> = (
    defaultValue: string,
    ref?: T,
) => { defaultValue: string; ref: T };

const useDefaultValue: UseDefaultValue = (defaultValue, ref) => {
    const or = <T, K>(a: T, b: K): NonNullable<T> | K => a ?? b;

    const $ref = or(ref, useRef<HTMLInputLikeElement>(null));

    useEffect(() => {
        if ($ref.current) {
            $ref.current.value = defaultValue;
        }
    }, [defaultValue, $ref]);
    return { ref: $ref, defaultValue };
};

export const Eidtor: React.FC<{
    lrcState: LrcState;
    lrcDispatch: React.Dispatch<LrcAction>;
}> = ({ lrcState, lrcDispatch }) => {
    const { prefState, lang, trimOptions } = useContext(appContext);

    const parse = useCallback(
        (ev: React.FocusEvent<HTMLTextAreaElement>) => {
            lrcDispatch({
                type: LrcActionType.parse,
                payload: { text: ev.target.value, options: trimOptions },
            });
        },
        [lrcDispatch, trimOptions],
    );

    const setInfo = useCallback(
        (ev: React.FocusEvent<HTMLInputElement>) => {
            const { name, value } = ev.target;
            lrcDispatch({
                type: LrcActionType.info,
                payload: { name, value },
            });
        },
        [lrcDispatch],
    );

    const text = stringify(lrcState, prefState);

    const details = useRef<HTMLDetailsElement>(null);

    const onDetailsToggle = useCallback(() => {
        sessionStorage.setItem(SSK.editorDetailsOpen, details.current!.open.toString());
    }, []);

    const detailsOpened = useMemo(() => {
        return sessionStorage.getItem(SSK.editorDetailsOpen) !== "false";
    }, []);

    const textarea = useRef<HTMLInputLikeElement>(null);
    const [href, setHref] = useState<string | undefined>(undefined);

    const onDownloadClick = useCallback(() => {
        setHref((url) => {
            if (url) {
                URL.revokeObjectURL(url);
            }

            return URL.createObjectURL(
                new Blob([textarea.current!.value], {
                    type: "text/plain;charset=UTF-8",
                }),
            );
        });
    }, []);

    const onTextFileUpload = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            if (ev.target.files === null || ev.target.files.length === 0) {
                return;
            }

            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                lrcDispatch({
                    type: LrcActionType.parse,
                    payload: { text: fileReader.result as string, options: trimOptions },
                });
            });
            fileReader.readAsText(ev.target.files[0], "UTF-8");
        },
        [lrcDispatch, trimOptions],
    );

    const onCopyClick = useCallback(() => {
        textarea.current?.select();
        document.execCommand("copy");
    }, []);

    const downloadName = useMemo(() => lrcFileName(lrcState.info), [lrcState.info]);

    const canSaveToGist = useMemo(() => {
        return localStorage.getItem(LSK.token) !== null && localStorage.getItem(LSK.gistId) !== null;
    }, []);

    const onGistSave = useCallback(() => {
        setTimeout(() => {
            const name = prompt(lang.editor.saveFileName, downloadName);
            if (name) {
                createFile(name, textarea.current!.value).catch((error: Error) => {
                    toastPubSub.pub({
                        type: "warning",
                        text: error.message,
                    });
                });
            }
        }, 500);
    }, [downloadName, lang]);

    return (
        <div className="app-editor">
            <details ref={details} open={detailsOpened} onToggle={onDetailsToggle}>
                <summary>{lang.editor.metaInfo}</summary>
                <section className="app-editor-infobox" onBlur={setInfo}>
                    <label htmlFor="info-ti">[ti:</label>
                    <input
                        id="info-ti"
                        name="ti"
                        placeholder={lang.editor.title}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("ti") || "")}
                    />
                    <label htmlFor="info-ti">]</label>
                    <label htmlFor="info-ar">[ar:</label>
                    <input
                        id="info-ar"
                        name="ar"
                        placeholder={lang.editor.artist}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("ar") || "")}
                    />
                    <label htmlFor="info-ar">]</label>
                    <label htmlFor="info-al">[al:</label>
                    <input
                        id="info-al"
                        name="al"
                        placeholder={lang.editor.album}
                        {...disableCheck}
                        {...useDefaultValue(lrcState.info.get("al") || "")}
                    />
                    <label htmlFor="info-al">]</label>
                </section>
            </details>

            <section className="editor-tools">
                <label className="editor-tools-item ripple" title={lang.editor.uploadText}>
                    <input hidden={true} type="file" accept="text/*, .txt, .lrc" onChange={onTextFileUpload} />
                    <OpenFileSVG />
                </label>
                <button className="editor-tools-item ripple" title={lang.editor.copyText} onClick={onCopyClick}>
                    <CopySVG />
                </button>
                <a
                    className="editor-tools-item ripple"
                    title={lang.editor.downloadText}
                    href={href}
                    onClick={onDownloadClick}
                    download={downloadName}
                >
                    <DownloadSVG />
                </a>

                <a
                    title={lang.editor.saveToGist}
                    href={canSaveToGist ? undefined : prependHash(ROUTER.gist)}
                    className="editor-tools-item ripple"
                    onClick={canSaveToGist ? onGistSave : undefined}
                >
                    <CloudUploadSVG />
                </a>

                <a title={lang.editor.utils} href="/lrc-utils/" className="editor-tools-item ripple">
                    <UtilitySVG />
                </a>
            </section>

            <textarea
                className="app-textarea"
                aria-label="lrc input here"
                onBlur={parse}
                {...disableCheck}
                {...useDefaultValue(text, textarea)}
            />
        </div>
    );
};
