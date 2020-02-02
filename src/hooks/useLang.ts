import { language as enUS } from "../languages/en-US.js";

export const useLang = (): [Language, (lang: string) => Promise<void>] => {
    const [value, setValue] = React.useState<Language>(enUS);

    const setLang = async (langCode: string): Promise<void> => {
        const { language } = (await import(
            /* webpackMode: "eager" */ `../languages/${langCode}.js`
        )) as typeof import("../languages/en-US.js");
        setValue(language);
    };

    return [value, React.useCallback((lang: string) => setLang(lang), [])];
};
