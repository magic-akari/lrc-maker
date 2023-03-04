const languages = import.meta.glob("./*.ts", { import: "language" });

export { languages };

export type Language = typeof import("./en-US.js")["language"];
