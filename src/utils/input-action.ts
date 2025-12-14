// All bindable actions (input-source agnostic)
export const enum InputAction {
    // Synchronizer actions
    Sync = "sync",
    DeleteTime = "deleteTime",
    ResetOffset = "resetOffset",
    DecreaseOffset = "decreaseOffset",
    IncreaseOffset = "increaseOffset",
    PrevLine = "prevLine",
    NextLine = "nextLine",
    FirstLine = "firstLine",
    LastLine = "lastLine",
    PageUp = "pageUp",
    PageDown = "pageDown",

    // Audio control actions
    SeekBackward = "seekBackward",
    SeekForward = "seekForward",
    ResetRate = "resetRate",
    IncreaseRate = "increaseRate",
    DecreaseRate = "decreaseRate",
    TogglePlay = "togglePlay",

    // Global actions
    ShowHelp = "showHelp",
}
