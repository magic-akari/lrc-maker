import { useCallback, useState } from "npm:react";
import { languages } from "../languages";
import { language as enUS } from "../languages/en-US.js";

export const useLang = (): [Language, (lang: string) => Promise<void>] => {
    const [value, setValue] = useState<Language>(enUS);

    const setLang = async (langCode: string): Promise<void> => {
        const l = await languages[`./${langCode}.ts`]();
        setValue(l as any);
    };

    return [value, useCallback((lang: string) => setLang(lang), [])];
};
