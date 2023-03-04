import { useCallback, useState } from "npm:react";
import { languages } from "../languages/index.js";
import enUS from "../languages/en-US.json";

export const useLang = (): [Language, (lang: string) => Promise<void>] => {
    const [value, setValue] = useState<Language>(enUS);

    const setLang = async (langCode: string): Promise<void> => {
        const l = await languages[`./${langCode}.json`]();
        setValue(l);
    };

    return [value, useCallback((lang: string) => setLang(lang), [])];
};
