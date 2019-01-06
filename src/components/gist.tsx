import {
    getAllGists,
    getGist,
    GistInfo,
    IGistFile,
    IGistRepo,
    postGist,
    Ratelimit,
} from "../utils/gistapi.js";
import { GithubSVG } from "./svg.js";

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
                            <a className="new-token-tip" href={newTokenUrl}>
                                <GithubSVG />
                                <span>
                                    Click here to generate a new Gihub Token
                                    with gist scope and paste it in the
                                    following input field.
                                </span>
                            </a>
                            <form onSubmit={onSubmitToken}>
                                <input
                                    type="text"
                                    name="token"
                                    minLength={40}
                                    maxLength={40}
                                    required
                                />
                                <input type="submit" />
                            </form>
                        </section>
                    );
                }
                if (gistId === null) {
                    return (
                        <>
                            <form onSubmit={onSubmitGistId}>
                                <input
                                    name="gist-id"
                                    type="text"
                                    list="gist-list"
                                />
                                <input type="submit" />
                                <datalist id="gist-list">
                                    {gistIdList &&
                                        gistIdList.map((id) => {
                                            return (
                                                <option key={id} value={id} />
                                            );
                                        })}
                                </datalist>
                            </form>
                            <button onClick={onCreateNewGist}>
                                Create new one
                            </button>
                        </>
                    );
                }
                if (fileList !== null) {
                    if (fileList.length === 0) {
                        return "empty";
                    }
                    return fileList.map((file) => {
                        return (
                            <article key={file.raw_url} data-url={file.raw_url}>
                                <section>{file.content}</section>
                                <h3>{file.filename}</h3>
                            </article>
                        );
                    });
                }

                return "loading";
            })()}
        </div>
    );
};
