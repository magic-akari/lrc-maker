const apiUrl = "https://api.github.com/gists";

export interface IGistFile {
    filename: string;
    content: string;
    truncated: boolean;
    raw_url: string;
}

export interface IGistRepo {
    id: string;
    description: string;
    files: { [filename: string]: IGistFile };
}

export type Ratelimit = Record<
    "x-ratelimit-limit" | "x-ratelimit-remaining" | "x-ratelimit-reset",
    string
>;

export const getAllGists = async (): Promise<IGistRepo[]> => {
    const token = localStorage.getItem(LSK.token);

    const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
            Authorization: `token ${token}`,
        },
        mode: "cors",
    });
    return res.json();
};

export const getGist = async (): Promise<{
    code: number;

    result: IGistRepo | null;
}> => {
    const token = localStorage.getItem(LSK.token);
    const id = localStorage.getItem(LSK.gistId);
    const etag = localStorage.getItem(LSK.gistEtag)!;

    const res = await fetch(`${apiUrl}/${id}`, {
        headers: {
            Authorization: `token ${token}`,
            ["If-None-Match"]: etag,
        },
    });
    localStorage.setItem(LSK.gistEtag, res.headers.get("etag")!);
    const code = res.status;

    const ratelimit: Ratelimit = {
        "x-ratelimit-limit": res.headers.get("x-ratelimit-limit")!,
        "x-ratelimit-remaining": res.headers.get("x-ratelimit-remaining")!,
        "x-ratelimit-reset": res.headers.get("x-ratelimit-reset")!,
    };

    sessionStorage.setItem(SSK.ratelimit, JSON.stringify(ratelimit));

    return {
        code,
        result: code === 200 ? await res.json() : null,
    };
};

export const enum GistInfo {
    description = "https://lrc-maker.github.io",
    fileName = ".lrc-maker",
    fileContent = "This file is used to be tracked and identified by https://lrc-maker.github.io",
}

export const postGist = async (): Promise<IGistRepo> => {
    const token = localStorage.getItem(LSK.token);

    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            Authorization: `token ${token}`,
        },
        body: JSON.stringify({
            description: GistInfo.description,
            public: true,
            files: {
                [GistInfo.fileName]: { content: GistInfo.fileContent },
            },
        }),
    });
    return res.json();
};
