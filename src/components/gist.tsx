import { GithubSVG } from "./svg.js";

const { useState, useCallback } = React;

const enum GIST {
    newTokenUrl = "https://github.com/settings/tokens/new?scopes=gist&description=https://lrc-maker.github.io",
    description = "https://lrc-maker.github.io",
    fileName = ".lrc-maker",
    fileContent = "This file is used to be tracked and identified by https://lrc-maker.github.io",
    apiUrl = "https://api.github.com/gists",
    htmlUrl = "https://gist.github.com",
}

interface IFile {
    filename: string;
    content: string;
    truncated: boolean;
    raw_url: string;
}

interface IGist {
    id: string;
    description: string;
    files: { [filename: string]: IFile };
}

export const Gist: React.FC = () => {
    const [token, setToken] = useState(localStorage.getItem(LSK.token));
    const [gistId, setGistId] = useState(localStorage.getItem(LSK.gistId));
    const [gistIdList, setGistIdList] = useState<string[] | undefined>(
        undefined,
    );
    const [fileList, setFileList] = useState<IFile[] | null>(
        JSON.parse(localStorage.getItem(LSK.gistFile) || "null"),
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
        fetch(GIST.apiUrl, {
            method: "POST",
            headers: {
                Authorization: `token ${token}`,
            },
            body: JSON.stringify({
                description: GIST.description,
                public: true,
                files: {
                    [GIST.fileName]: { content: GIST.fileContent },
                },
            }),
        })
            .then((res) => res.json())
            .then((json: IGist) => {
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

    if (token === null) {
        return (
            <div className="gist">
                <section className="new-token">
                    <a className="new-token-tip" href={GIST.newTokenUrl}>
                        <GithubSVG />
                        <span>
                            Click here to generate a new Gihub Token with gist
                            scope and paste it in the following input field.
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
            </div>
        );
    }

    if (gistId === null) {
        if (gistIdList === undefined) {
            fetch(GIST.apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `token ${token}`,
                },
                mode: "cors",
            })
                .then((res) => {
                    return res.json();
                })
                .then((json: IGist[]) => {
                    setGistIdList(
                        json
                            .filter((gist) => {
                                return (
                                    gist.description === GIST.description &&
                                    GIST.fileName in gist.files
                                );
                            })
                            .map(({ id }) => id),
                    );
                });

            return <div className="gist">loading</div>;
        }
        return (
            <div className="gist">
                <form onSubmit={onSubmitGistId}>
                    <input
                        name="gist-id"
                        type="text"
                        list="gist-list"
                        defaultValue={gistIdList[0]}
                    />
                    <input type="submit" />
                    <datalist id="gist-list">
                        {gistIdList.map((id) => {
                            return <option key={id} value={id} />;
                        })}
                    </datalist>
                </form>
                <button onClick={onCreateNewGist}>Create new one</button>
            </div>
        );
    }

    fetch(`${GIST.apiUrl}/${gistId}`, {
        headers: {
            Authorization: `token ${token}`,
            ["If-None-Match"]: localStorage.getItem(LSK.gistEtag)!,
        },
    }).then((res) => {
        if (res.status === 304) {
            console.log("not modified");
            return;
        }

        const etag = res.headers.get("etag")!;
        localStorage.setItem(LSK.gistEtag, etag);
        return res.json().then((gist: IGist) => {
            const files = Object.values(gist.files);
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
            console.log(gist);
        });
    });
    console.log(fileList);

    return <div className="gist">gist</div>;
};
