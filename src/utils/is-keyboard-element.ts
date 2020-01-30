export const isKeyboardElement = (element: EventTarget | null): boolean => {
    if (element === null) {
        return false;
    }

    const type = (element as HTMLInputElement | HTMLTextAreaElement).type;

    return type === "textarea" || type === "text" || type === "url";
};
