// smooth scroll
// only for special usage of lrc maker
(() => {
    if ("scrollBehavior" in document.documentElement.style) {
        return;
    }

    const duration = 468;

    const now = (() => {
        return "performance" in window ? performance.now.bind(performance) : Date.now;
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

        const currentY = context.startY + (context.stopY - context.startY) * value;

        context.method(0, currentY);

        if (currentY !== context.stopY) {
            rafID.current = requestAnimationFrame(() => step(context));
        }
    };

    const scrollIntoView = Element.prototype.scrollIntoView;

    const scroll =
        Element.prototype.scroll ||
        Element.prototype.scrollTo ||
        function(this: Element, x: number, y: number) {
            this.scrollLeft = x;
            this.scrollTop = y;
        };

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
            method: (x: number, y: number) => scroll.call(se, x, y),
            startTime: now(),
            startY,
            stopY,
        });
    };
})();

export {};
