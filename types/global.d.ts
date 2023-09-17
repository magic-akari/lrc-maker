import type { Language as L } from "../src/languages";

declare global {
    type Mutable<T> = { -readonly [P in keyof T]: T[P] };

    type Language = L;

    type Fixed = 0 | 1 | 2 | 3;

    interface String {
        trimStart(): string;
        trimEnd(): string;
        trimLeft(): string;
        trimRight(): string;
    }

    interface Navigator {
        standalone: boolean;
    }

    namespace i18n {
        const langCodeList: readonly string[];
        const langMap: readonly [code: string, display: string][];
    }
}

declare module "react" {
    function useContext<T>(context: Context<T>, observedBits?: number | boolean): T;
    function createContext<T>(defaultValue?: T, calculateChangedBits?: (prev: T, next: T) => number): Context<T>;
}
