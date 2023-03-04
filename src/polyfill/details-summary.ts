const details = document.createElement("details");

const polyfilldetails = (): void => {
    const prototype = details.constructor.prototype as HTMLDetailsElement;
    const openProperty = Object.getOwnPropertyDescriptor(prototype, "open");

    Object.defineProperties(prototype, {
        open: {
            get(this: HTMLDetailsElement): boolean {
                if (this.tagName === "DETAILS") {
                    return this.hasAttribute("open");
                } else {
                    return openProperty?.get?.call(this) as boolean;
                }
            },
            set(this: HTMLDetailsElement, value: boolean): void {
                if (this.tagName === "DETAILS") {
                    if (value !== this.hasAttribute("open")) {
                        const event = document.createEvent("Event");
                        event.initEvent("toggle", false, false);
                        this.dispatchEvent(event);
                    }
                    return value ? this.setAttribute("open", "") : this.removeAttribute("open");
                } else {
                    return openProperty?.set?.call(this, value);
                }
            },
        },
    });

    document.addEventListener("click", (event) => {
        const element = event.target as Element;
        const summary = element.closest("summary");
        const details = summary?.parentElement as HTMLDetailsElement | null | undefined;
        if (!details || details.tagName !== "DETAILS") {
            return;
        }

        details.open = !details.open;
    });
};

if (!("open" in details)) {
    polyfilldetails();
}
