import { createContext, useContext } from "react";
import { defaultKeyBindings } from "../utils/default-keybindings.js";
import type { KeyBindings } from "../utils/keybindings.js";

export const KeyBindingsContext = createContext<KeyBindings>(defaultKeyBindings);

export function useKeyBindings(): KeyBindings {
    return useContext(KeyBindingsContext);
}
