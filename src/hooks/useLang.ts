import { language as en_US } from "../languages/en-US.js";

export const useLang = (): [Language, (lang: string) => Promise<void>] => {
    const [value, setValue] = React.useState<Language>(en_US);

    const setLang = (langName: string) => {
        return import(/* webpackMode: "eager" */
        `../languages/${langName}.js`).then(({ language }) => {
            setValue(language);
        });
    };

    return [value, React.useCallback((lang: string) => setLang(lang), [])];
};
