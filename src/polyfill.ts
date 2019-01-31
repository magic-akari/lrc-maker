(() => {
    const StrProto = String.prototype;

    if (!StrProto.trimStart) {
        StrProto.trimStart =
            StrProto.trimLeft ||
            function(this: string) {
                return this.replace(/^\s+/, "");
            };
    }

    if (!StrProto.trimEnd) {
        StrProto.trimEnd =
            StrProto.trimRight ||
            function(this: string) {
                return this.replace(/\s+$/, "");
            };
    }

    if (!StrProto.startsWith) {
        StrProto.startsWith = function(searchString, position) {
            let start = position || 0;
            if (start < 0) {
                start = 0;
            }
            if (start > this.length) {
                start = this.length;
            }
            const end = start + searchString.length;
            if (end > this.length) {
                return false;
            }
            return this.slice(start, end) === searchString;
        };
    }

    if (!StrProto.endsWith) {
        StrProto.endsWith = function(searchString, endPosition) {
            let end = endPosition || this.length;
            if (end < 0) {
                end = 0;
            }
            if (end > this.length) {
                end = this.length;
            }
            const start = end - searchString.length;
            if (start < 0) {
                return false;
            }
            return this.slice(start, end) === searchString;
        };
    }

    if (!StrProto.padStart) {
        StrProto.padStart = function(maxLength, fillString) {
            // floor if number or convert non-number to 0;
            maxLength = maxLength >> 0;

            if (this.length > maxLength) {
                return String(this);
            } else {
                fillString = String(
                    typeof fillString !== "undefined" ? fillString : " ",
                );

                const padLength = maxLength - this.length;
                if (padLength > fillString.length) {
                    // append to original to ensure we are longer than needed
                    fillString += fillString.repeat(
                        padLength / fillString.length,
                    );
                }
                return fillString.slice(0, padLength) + String(this);
            }
        };
    }

    if (!StrProto.padEnd) {
        StrProto.padEnd = function(maxLength, fillString) {
            // floor if number or convert non-number to 0;
            maxLength = maxLength >> 0;

            if (this.length > maxLength) {
                return String(this);
            } else {
                fillString = String(
                    typeof fillString !== "undefined" ? fillString : " ",
                );

                const padLength = maxLength - this.length;
                if (padLength > fillString.length) {
                    // append to original to ensure we are longer than needed
                    fillString += fillString.repeat(
                        padLength / fillString.length,
                    );
                }
                return String(this) + fillString.slice(0, padLength);
            }
        };
    }
})();

// smooth scroll
// only for special usage of lrc maker
(() => {
    if ("scrollBehavior" in document.documentElement.style) {
        return;
    }

    const duration = 468;

    const now = (() => {
        return "performance" in window
            ? performance.now.bind(performance)
            : Date.now;
    })();

    const ease = (k: number) => {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    };

    interface IContext {
        method: (x: number, y: number) => void;
        startTime: number;
        startY: number;
        stopY: number;
    }

    const rafID = {
        current: 0,
    };

    const cancelScroll = () => {
        cancelAnimationFrame(rafID.current);
        cleanEventListener();
    };

    const listenerOptions = {
        passive: true,
        once: true,
    };

    const atachEventListener = () => {
        window.addEventListener("wheel", cancelScroll, listenerOptions);
        window.addEventListener("touchmove", cancelScroll, listenerOptions);
    };

    const cleanEventListener = () => {
        window.removeEventListener("wheel", cancelScroll);
        window.removeEventListener("touchmove", cancelScroll);
    };

    const step = (context: IContext) => {
        const time = now();
        const elapsed = (time - context.startTime) / duration;

        if (elapsed >= 1) {
            context.method(0, context.stopY);
            cleanEventListener();
            return;
        }

        // apply easing to elapsed time
        const value = ease(elapsed);

        const currentY =
            context.startY + (context.stopY - context.startY) * value;

        context.method(0, currentY);

        if (currentY !== context.stopY) {
            rafID.current = requestAnimationFrame(() => step(context));
        }
    };

    const scrollIntoView = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = function(arg) {
        if (arg === undefined || arg === true || arg === false) {
            return scrollIntoView.call(this, arg);
        }

        const { top, bottom } = this.getBoundingClientRect();

        const center = (top + bottom) / 2;

        const se = document.scrollingElement!;

        const startY = se.scrollTop;
        const stopY = startY + center - window.innerHeight / 2;

        atachEventListener();

        step({
            method: (x: number, y: number) => se.scrollTo(x, y),
            startTime: now(),
            startY,
            stopY,
        });
    };
})();
