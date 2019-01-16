import { useLang } from "../hooks/useLang.js";
import {
    Action as PrefAction,
    State as PrefState,
    usePref,
} from "../hooks/usePref.js";

const { createContext, useEffect, useMemo } = React;

interface IAppContext {
    lang: Language;
    prefState: PrefState;
    prefDispatch: React.Dispatch<PrefAction>;
}

// tslint:disable:no-bitwise
const enum Bits {
    lang,
    spaceStart,
    spaceEnd,
    fixed,
    builtInAudio,
    screenButton,
    themeColor,
}

export const enum ChangBits {
    lang = 1 << Bits.lang,
    spaceStart = 1 << Bits.spaceStart,
    spaceEnd = 1 << Bits.spaceEnd,
    fixed = 1 << Bits.fixed,
    builtInAudio = 1 << Bits.builtInAudio,
    screenButton = 1 << Bits.screenButton,
    themeColor = 1 << Bits.themeColor,

    prefState = lang |
        spaceStart |
        spaceEnd |
        fixed |
        builtInAudio |
        screenButton |
        themeColor,
}

export const appContext = createContext<IAppContext>(
    {} as IAppContext,
    (prev, next) => {
        let bits = 0;

        if (prev.lang !== next.lang) {
            bits |= ChangBits.lang;
        }
        if (prev.prefState.spaceStart !== next.prefState.spaceStart) {
            bits |= ChangBits.spaceStart;
        }
        if (prev.prefState.spaceEnd !== next.prefState.spaceEnd) {
            bits |= ChangBits.spaceEnd;
        }
        if (prev.prefState.fixed !== next.prefState.fixed) {
            bits |= ChangBits.fixed;
        }
        if (prev.prefState.builtInAudio !== next.prefState.builtInAudio) {
            bits |= ChangBits.builtInAudio;
        }
        if (prev.prefState.screenButton !== next.prefState.screenButton) {
            bits |= ChangBits.screenButton;
        }
        if (prev.prefState.screenButton !== next.prefState.screenButton) {
            bits |= ChangBits.screenButton;
        }
        if (prev.prefState.themeColor !== next.prefState.themeColor) {
            bits |= ChangBits.themeColor;
        }
        return bits;
    },
);

export const AppProvider: React.FC = ({ children }) => {
    const [prefState, prefDispatch] = usePref(
        localStorage.getItem(LSK.preferences) || Const.emptyString,
    );

    const [lang, setLang] = useLang();

    useEffect(
        () => {
            setLang(prefState.lang);
        },
        [prefState.lang],
    );

    useEffect(
        () => {
            document.title = lang.app.fullname;
        },
        [lang],
    );

    const value = useMemo(
        () => {
            return {
                lang,
                prefState,
                prefDispatch,
            };
        },
        [lang, prefState],
    );

    return <appContext.Provider value={value}>{children}</appContext.Provider>;
};
