import { createHash, Utf8AsciiLatin1Encoding } from "crypto";
import { readFileSync } from "fs";

export const sri = (file: string) => {
    const enc: Utf8AsciiLatin1Encoding = "utf8";
    const body = readFileSync(file, { encoding: enc });
    const hash = createHash("sha256").update(body, enc);
    const sha = hash.digest("base64");

    return "sha256-" + sha;
};
