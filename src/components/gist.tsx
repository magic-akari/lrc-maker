import {
    getAllGists,
    getGist,
    GistInfo,
    IGistFile,
    IGistRepo,
    postGist,
    Ratelimit,
} from "../utils/gistapi.js";
import { CloudDownloadSVG, GithubSVG } from "./svg.js";

const { useState, useCallback, useEffect, useMemo } = React;

const newTokenUrl =
    "https://github.com/settings/tokens/new?scopes=gist&description=https://lrc-maker.github.io";

export const Gist: React.FC = () => {
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

            getGist().then(({ result }) => {
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
            });
        },
        [gistId],
    );

    return (
        <div className="gist">
            {(() => {
                if (token === null) {
                    return (
                        <section className="new-token">
                            <a
                                className="new-token-tip"
                                target="_blank"
                                href={newTokenUrl}>
                                <GithubSVG />
                                <span className="new-token-tip-text">
                                    Click here to generate a new Gihub Token
                                    with gist scope and paste it in the
                                    following input field.
                                </span>
                            </a>
                            <form
                                className="new-token-form"
                                onSubmit={onSubmitToken}>
                                <input
                                    className="new-token-input"
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
                                <datalist id="gist-list">
                                    {gistIdList &&
                                        gistIdList.map((id) => {
                                            return (
                                                <option key={id} value={id} />
                                            );
                                        })}
                                </datalist>
                            </form>
                        </section>
                    );
                }
                if (fileList !== null) {
                    return (
                        <section className="file-list">
                            {fileList.map((file) => {
                                return (
                                    <article
                                        className="file-item"
                                        key={file.raw_url}>
                                        <section className="file-content">
                                            {file.content}
                                        </section>
                                        <hr />
                                        <section className="file-info">
                                            <span className="file-title">
                                                {file.filename}
                                            </span>
                                            <button className="file-load">
                                                <CloudDownloadSVG />
                                            </button>
                                        </section>
                                    </article>
                                );
                            })}
                        </section>
                    );
                }

                return "loading";
            })()}
        </div>
    );
};
