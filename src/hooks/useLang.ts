import { toastPubSub } from "../components/toast.js";
import { language as en_US } from "../languages/en-US.js";

const cache = new Map<string, Language>();
cache.set("en-US", en_US);

export const useLang = (): [Language, (lang: string) => void] => {
    const [value, setValue] = React.useState<Language>(en_US);

    const setLang = (langName: string) => {
        if (cache.has(langName)) {
            const cachedLang = cache.get(langName)!;

            setValue(cachedLang);

            return;
        }

        try {
            import(`../languages/${langName}.js`).then(({ language }) => {
                cache.set(langName, language);
                setValue(language);
            });
        } catch (error) {
            toastPubSub.pub({
                type: "warning",
                text: error.message,
            });
        }
    };

    return [value, React.useCallback((lang: string) => setLang(lang), [])];
};

const Import = (url: string): Promise<any> => {
    const selfUrl = new Error().stack!.match(/(?:file|https?):\/\/\S+\.js/)![0];
    const reslovedUrl = new URL(url, selfUrl);
    return new Promise((resolve, reject) => {
        const vector =
            "$importModule$" +
            Math.random()
                .toString(32)
                .slice(2);
        const script = document.createElement("script");
        const win = window as any;
        const destructor = () => {
            delete win[vector];
            URL.revokeObjectURL(script.src);
            script.remove();
        };
        script.type = "module";
        script.onload = () => {
            resolve(win[vector]);
            destructor();
        };

        script.onerror = () => {
            reject(new Error(`Failed to import: ${reslovedUrl}`));
            destructor();
        };

        const loader = `import * as m from "${reslovedUrl}"; window.${vector} = m;`;
        const blob = new Blob([loader], { type: "text/ecmascript" });
        script.src = URL.createObjectURL(blob);

        document.head.appendChild(script);
    });
};
