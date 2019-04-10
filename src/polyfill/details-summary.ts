const details = document.createElement("details");

const polyfilldetails = () => {
    const prototype = details.constructor.prototype;
    const open = Object.getOwnPropertyDescriptor(prototype, "open");

    Object.defineProperties(prototype, {
        open: {
            get() {
                if (this.tagName === "DETAILS") {
                    return this.hasAttribute("open");
                } else {
                    if (open && open.get) {
                        return open.get.call(this);
                    }
                }
            },
            set(value) {
                if (this.tagName === "DETAILS") {
                    if (value !== this.hasAttribute("open")) {
                        const event = document.createEvent("Event");
                        event.initEvent("toggle", false, false);
                        this.dispatchEvent(event);
                    }
                    return value ? this.setAttribute("open", "") : this.removeAttribute("open");
                } else {
                    if (open && open.set) {
                        return open.set.call(this, value);
                    }
                }
            },
        },
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        let element = target as Element;
        while (element.tagName !== "SUMMARY" && element !== document.body) {
            element = element.parentElement as Element;
        }
        if (element.tagName === "SUMMARY" && element.parentElement!.tagName === "DETAILS") {
            const parentElement = element.parentElement as HTMLDetailsElement;
            parentElement.open = !parentElement.open;
        }
    });
};

if (!("open" in details)) {
    polyfilldetails();
}
