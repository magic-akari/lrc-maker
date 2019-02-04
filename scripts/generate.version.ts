import { format, Options } from "prettier";

import * as options from "../.prettierrc.json";
import { version } from "../package.json";

const versionTs = `declare global {
    const enum Version {
        value = ${JSON.stringify(version)},
    }
}

export {};
`;

process.stdout.write(
    format(versionTs, {
        ...(options as Options),
        parser: "typescript",
    }),
);
