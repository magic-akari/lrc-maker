// TODO: fix eslint
/* eslint-disable */
import GISTINFO from "#const/gist_info.json" assert { type: "json" };
import LSK from "#const/local_key.json" assert { type: "json" };
import SSK from "#const/session_key.json" assert { type: "json" };

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
    files: Record<string, IGistFile>;
}

export type Ratelimit = Record<"x-ratelimit-limit" | "x-ratelimit-remaining" | "x-ratelimit-reset", string>;

export const getRepos = async (): Promise<IGistRepo[]> => {
    const token = localStorage.getItem(LSK.token);

    const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
            Authorization: `token ${token}`,
        },
        mode: "cors",
    });

    if (!res.ok) {
        throw new Error(res.statusText);
    }
    return res.json();
};

export const createRepo = async (): Promise<IGistRepo> => {
    const token = localStorage.getItem(LSK.token);

    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            Authorization: `token ${token}`,
        },
        body: JSON.stringify({
            description: GISTINFO.description,
            public: true,
            files: {
                [GISTINFO.fileName]: { content: GISTINFO.fileContent },
            },
        }),
    });

    if (!res.ok) {
        throw new Error(res.statusText);
    }
    return res.json();
};

export const assignRepo = async (): Promise<IGistRepo> => {
    const token = localStorage.getItem(LSK.token);
    const id = localStorage.getItem(LSK.gistId);

    const res = await fetch(`${apiUrl}/${id}`, {
        method: "PATCH",
        headers: {
            Authorization: `token ${token}`,
        },
        body: JSON.stringify({
            description: GISTINFO.description,
            files: {
                [GISTINFO.fileName]: { content: GISTINFO.fileContent },
            },
        }),
    });

    if (!res.ok) {
        throw new Error(res.statusText);
    }
    return res.json();
};

export const getFils = async (): Promise<IGistRepo | null> => {
    const token = localStorage.getItem(LSK.token);
    const id = localStorage.getItem(LSK.gistId);
    const etag = localStorage.getItem(LSK.gistEtag)!;

    const res = await fetch(`${apiUrl}/${id}`, {
        headers: {
            "Authorization": `token ${token}`,
            "If-None-Match": etag,
        },
    });
    if (!res.ok) {
        if (res.status >= 400) {
            throw await res.json();
        }
    }
    localStorage.setItem(LSK.gistEtag, res.headers.get("etag")!);
    const ratelimit: Ratelimit = {
        "x-ratelimit-limit": res.headers.get("x-ratelimit-limit")!,
        "x-ratelimit-remaining": res.headers.get("x-ratelimit-remaining")!,
        "x-ratelimit-reset": res.headers.get("x-ratelimit-reset")!,
    };
    sessionStorage.setItem(SSK.ratelimit, JSON.stringify(ratelimit));
    return res.status === 200 ? res.json() : null;
};

export const createFile = async (fileName: string, content: string): Promise<IGistRepo> => {
    const token = localStorage.getItem(LSK.token);
    const id = localStorage.getItem(LSK.gistId);

    const res = await fetch(`${apiUrl}/${id}`, {
        method: "PATCH",
        headers: {
            Authorization: `token ${token}`,
        },
        body: JSON.stringify({
            files: {
                [fileName]: { content },
            },
        }),
    });

    if (!res.ok) {
        throw new Error(res.statusText);
    }
    return res.json();
};
