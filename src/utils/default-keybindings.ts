import { InputAction } from "./input-action.js";
import type { KeyBindings } from "./keybindings.js";

// Default keybindings using `code` (physical key position, layout-agnostic)
// Only use `key` for special characters like "?" that require shift
export const defaultKeyBindings: KeyBindings = {
    // Synchronizer actions
    [InputAction.Sync]: [{ code: "Space" }],
    [InputAction.DeleteTime]: [{ code: "Backspace" }, { code: "Delete" }],
    [InputAction.ResetOffset]: [{ code: "Digit0" }],
    [InputAction.DecreaseOffset]: [{ code: "Minus" }],
    [InputAction.IncreaseOffset]: [{ code: "Equal" }],
    [InputAction.PrevLine]: [{ code: "ArrowUp" }, { code: "KeyW" }, { code: "KeyJ" }],
    [InputAction.NextLine]: [{ code: "ArrowDown" }, { code: "KeyS" }, { code: "KeyK" }],
    [InputAction.FirstLine]: [{ code: "Home" }],
    [InputAction.LastLine]: [{ code: "End" }],
    [InputAction.PageUp]: [{ code: "PageUp" }],
    [InputAction.PageDown]: [{ code: "PageDown" }],

    // Audio control actions
    [InputAction.SeekBackward]: [{ code: "ArrowLeft" }, { code: "KeyA" }, { code: "KeyH" }],
    [InputAction.SeekForward]: [{ code: "ArrowRight" }, { code: "KeyD" }, { code: "KeyL" }],
    [InputAction.ResetRate]: [{ code: "KeyR" }],
    [InputAction.IncreaseRate]: [{ code: "ArrowUp", ctrlKey: true }, { code: "KeyJ", ctrlKey: true }],
    [InputAction.DecreaseRate]: [{ code: "ArrowDown", ctrlKey: true }, { code: "KeyK", ctrlKey: true }],
    [InputAction.TogglePlay]: [{ code: "Enter", ctrlKey: true }],

    // Global actions
    [InputAction.ShowHelp]: [{ key: "?" }],
};
