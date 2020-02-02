import { createHash, Utf8AsciiLatin1Encoding } from "crypto";
import { readFileSync } from "fs";

const enc: Utf8AsciiLatin1Encoding = "utf8";

export const sriContent = (content: string): string => {
    const hash = createHash("sha256").update(content, enc);
    const sha = hash.digest("base64");

    return "sha256-" + sha;
};

export const sri = (file: string): string => {
    const content = readFileSync(file, { encoding: enc });
    return sriContent(content);
};
