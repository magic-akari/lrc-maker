import {
    Action as LrcAction,
    ActionType as LrcActionType,
} from "../hooks/useLrc.js";
import {
    getAllGists,
    getGist,
    GistInfo,
    IGistFile,
    IGistRepo,
    postGist,
    Ratelimit,
} from "../utils/gistapi.js";
import { EditorSVG, GithubSVG, SynchronizerSVG } from "./svg.js";
import { toastPubSub } from "./toast.js";

const { useState, useCallback, useEffect, useMemo } = React;

const newTokenUrl =
    "https://github.com/settings/tokens/new?scopes=gist&description=https://lrc-maker.github.io";

interface IGistProps {
    lrcDispatch: React.Dispatch<LrcAction>;
}

export const Gist: React.FC<IGistProps> = ({ lrcDispatch }) => {
    const [token, setToken] = useState(localStorage.getItem(LSK.token));
    const [gistId, setGistId] = useState(localStorage.getItem(LSK.gistId));
    const [gistIdList, setGistIdList] = useState<string[] | undefined>(
        undefined,
    );
    const [fileList, setFileList] = useState<IGistFile[] | null>(
        JSON.parse(localStorage.getItem(LSK.gistFile)!),
    );

    const ratelimit: Ratelimit | null = useMemo(
        () => {
            return JSON.parse(sessionStorage.getItem(SSK.ratelimit)!);
        },
        [fileList],
    );

    const onSubmitToken = useCallback(
        (ev: React.FormEvent<HTMLFormElement>) => {
            ev.preventDefault();

            const form = ev.target as HTMLFormElement;
            const tokenInput = form.elements.namedItem(
                "token",
            )! as HTMLInputElement;

            const value = tokenInput.value;

            localStorage.setItem(LSK.token, value);
            setToken(value);
        },
        [],
    );

    const onCreateNewGist = useCallback(() => {
        postGist().then((json: IGistRepo) => {
            localStorage.setItem(LSK.gistId, json.id);
            setGistId(json.id);
        });
    }, []);

    const onSubmitGistId = useCallback(
        (ev: React.FormEvent<HTMLFormElement>) => {
            ev.preventDefault();

            const form = ev.target as HTMLFormElement;
            const gistIdInput = form.elements.namedItem(
                "gist-id",
            )! as HTMLInputElement;
            const value = gistIdInput.value;

            localStorage.setItem(LSK.gistId, value);
            setGistId(value);
        },
        [],
    );

    useEffect(
        () => {
            if (gistId !== null) {
                return;
            }

            if (!("HTMLDataListElement" in window)) {
                return;
            }

            getAllGists().then((result) => {
                setGistIdList(
                    result
                        .filter((gist) => {
                            return (
                                gist.description === GistInfo.description &&
                                GistInfo.fileName in gist.files
                            );
                        })
                        .map(({ id }) => id),
                );
            });
        },
        [token, gistId],
    );

    useEffect(
        () => {
            if (gistId === null) {
                return;
            }

            getGist()
                .then((result) => {
                    if (result === null) {
                        return;
                    }

                    const files = Object.values(result.files).filter((file) =>
                        file.filename.endsWith(".lrc"),
                    );
                    localStorage.setItem(
                        LSK.gistFile,
                        JSON.stringify(files, [
                            "filename",
                            "content",
                            "truncated",
                            "raw_url",
                        ]),
                    );
                    setFileList(files);
                })
                .catch((error) => {
                    console.log(error);
                    toastPubSub.pub({
                        type: "warning",
                        text: error.message,
                    });
                });
        },
        [gistId],
    );

    const onLoadFile = useCallback(
        (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
            const target = ev.target as HTMLElement;

            if (!("key" in target.dataset)) {
                return;
            }

            const key = Number.parseInt(target.dataset.key!, 10);
            const file = fileList![key];
            if (file.truncated) {
                fetch(file.raw_url)
                    .then((res) => res.text())
                    .then((text) => {
                        lrcDispatch({
                            type: LrcActionType.parse,
                            payload: text,
                        });
                    });
            } else {
                lrcDispatch({
                    type: LrcActionType.parse,
                    payload: file.content,
                });
            }
        },
        [],
    );

    const onClear = useCallback(() => {
        setGistId(null);
        setToken(null);
    }, []);

    const RateLimitJSX = useMemo(
        () => {
            if (ratelimit === null) {
                return false;
            }

            return (
                <section className="ratelimit">
                    <p>
                        {"ratelimit-limit: "}
                        {ratelimit["x-ratelimit-limit"]}
                    </p>
                    <p>
                        {"ratelimit-remaining: "}
                        {ratelimit["x-ratelimit-remaining"]}
                    </p>
                    <p>
                        {"ratelimit-reset: "}
                        {new Date(
                            Number.parseInt(ratelimit["x-ratelimit-reset"], 10),
                        ).toLocaleString()}
                    </p>
                </section>
            );
        },
        [ratelimit],
    );

    return (
        <div className="gist">
            {(() => {
                if (token === null) {
                    return (
                        <section className="new-token">
                            <GithubSVG />
                            <p className="new-token-tip-text">
                                lrc-maker need Github Token to get and post
                                lyric to Github Gist.
                            </p>
                            <a
                                className="new-token-tip button"
                                target="_blank"
                                href={newTokenUrl}>
                                Generate a new Github Token
                            </a>
                            <form
                                className="new-token-form"
                                onSubmit={onSubmitToken}>
                                <label htmlFor="github-token">Token:</label>
                                <input
                                    className="new-token-input"
                                    id="github-token"
                                    type="text"
                                    name="token"
                                    minLength={40}
                                    maxLength={40}
                                    required
                                />
                                <input
                                    className="new-token-submit button"
                                    type="submit"
                                />
                            </form>
                        </section>
                    );
                }
                if (gistId === null) {
                    return (
                        <section className="get-gist-id">
                            <GithubSVG />
                            <button
                                className="create-new-gist button"
                                onClick={onCreateNewGist}>
                                Create a new Gist Repo
                            </button>
                            <form
                                className="gist-id-form"
                                onSubmit={onSubmitGistId}>
                                <label htmlFor="gist-id">Gist id:</label>
                                <input
                                    className="gist-id-input"
                                    id="gist-id"
                                    name="gist-id"
                                    type="text"
                                    list="gist-list"
                                    placeholder="Or assign an exist one"
                                    required
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                />

                                <input className="button" type="submit" />
                                {gistIdList && (
                                    <datalist id="gist-list">
                                        {gistIdList.map((id) => {
                                            return (
                                                <option key={id} value={id} />
                                            );
                                        })}
                                    </datalist>
                                )}
                            </form>
                        </section>
                    );
                }
                if (fileList !== null) {
                    return (
                        <>
                            <details className="gist-details">
                                <summary>info</summary>
                                <section className="gist-bar">
                                    <section className="gist-info">
                                        <p>
                                            {"gist id: "}
                                            <span className="select-all">
                                                {gistId}
                                            </span>
                                        </p>
                                        <button
                                            className="button"
                                            onClick={onClear}>
                                            clear token and gist id
                                        </button>
                                    </section>
                                    {RateLimitJSX}
                                </section>
                            </details>

                            <section className="file-list" onClick={onLoadFile}>
                                {fileList.map((file, index) => {
                                    return (
                                        <article
                                            className="file-item"
                                            key={file.raw_url}>
                                            <section className="file-content">
                                                {file.content}
                                            </section>
                                            <hr />
                                            <section className="file-bar">
                                                <span className="file-title">
                                                    {file.filename}
                                                </span>
                                                <span className="file-action">
                                                    <a
                                                        className="file-load"
                                                        href={Path.editor}
                                                        data-key={index}>
                                                        <EditorSVG />
                                                    </a>
                                                    <a
                                                        className="file-load"
                                                        href={Path.synchronizer}
                                                        data-key={index}>
                                                        <SynchronizerSVG />
                                                    </a>
                                                </span>
                                            </section>
                                        </article>
                                    );
                                })}
                            </section>
                        </>
                    );
                }

                return "loading";
            })()}
        </div>
    );
};
