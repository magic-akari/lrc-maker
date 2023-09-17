import { useCallback, useState } from "react";
import enUS from "../languages/en-US.json" assert { type: "json" };
import { languages } from "../languages/index.js";

export const useLang = (): [Language, (lang: string) => Promise<void>] => {
    const [value, setValue] = useState<Language>(enUS);

    const setLang = async (langCode: string): Promise<void> => {
        const l = await languages[`./${langCode}.json`]();
        setValue(l);
    };

    return [value, useCallback(async (lang: string) => setLang(lang), [])];
};
