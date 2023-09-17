const languages = import.meta.glob<Language>("./*.json", { as: "json", import: "default" });

export { languages };

export type Language = typeof import("./en-US.json");
