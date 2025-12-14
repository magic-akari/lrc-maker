import { InputAction } from "./input-action.js";

// Keyboard key binding definition
export interface KeyBinding {
    code?: string; // KeyboardEvent.code
    key?: string; // KeyboardEvent.key
    ctrlKey?: boolean; // Requires Ctrl/Cmd
    shiftKey?: boolean; // Requires Shift
    altKey?: boolean; // Requires Alt
}

// Action to keyboard bindings mapping
export type KeyBindings = Record<InputAction, KeyBinding[]>;

export function matchKeyBinding(ev: KeyboardEvent, bindings: KeyBinding[]): boolean {
    return bindings.some((binding) => {
        // Modifier key matching strategy:
        // - Ctrl/Cmd: strict bidirectional check to prevent conflicts with browser shortcuts (e.g., Ctrl+W)
        // - Shift/Alt: only require if binding specifies, allow extra modifiers otherwise
        //   (e.g., Shift+ArrowUp still triggers PrevLine, matching original behavior)
        const ctrlOrMeta = ev.ctrlKey || ev.metaKey;
        if (binding.ctrlKey && !ctrlOrMeta) return false;
        if (!binding.ctrlKey && ctrlOrMeta) return false;
        if (binding.shiftKey && !ev.shiftKey) return false;
        if (binding.altKey && !ev.altKey) return false;

        // Check key
        if (binding.code && ev.code === binding.code) return true;
        if (binding.key && ev.key === binding.key) return true;
        return false;
    });
}

export function getMatchedAction(ev: KeyboardEvent, keyBindings: KeyBindings): InputAction | null {
    for (const [action, bindings] of Object.entries(keyBindings)) {
        if (matchKeyBinding(ev, bindings)) {
            return action as InputAction;
        }
    }
    return null;
}
