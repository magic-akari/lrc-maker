import { createPubSub } from "../utils/pubsub.js";
import { CheckSVG, InfoSVG, ProblemSVG } from "./svg.js";

type MessageType = "info" | "success" | "warning";

interface IMessage {
    type: MessageType;
    text: string;
}

export const toastPubSub = createPubSub<IMessage>();

const { useState, useEffect, useCallback, useRef } = React;

let id = 0;

export const Toast = () => {
    const self = useRef(Symbol(Toast.name));

    interface IToast extends IMessage {
        id: number;
    }

    const [toastQueue, setToastQueue] = useState<IToast[]>([]);
    const queueRef = useRef(toastQueue);
    queueRef.current = toastQueue;

    useEffect(() => {
        toastPubSub.sub(self.current, (data) => {
            setToastQueue([{ id: id++, ...data }, ...queueRef.current]);
        });
    }, []);

    const onAnimationEnd = useCallback(
        (ev: React.AnimationEvent<HTMLElement>) => {
            if (ev.animationName === "slideOutRight") {
                const newQueue = queueRef.current.slice();
                newQueue.pop();
                setToastQueue(newQueue);
            }
        },
        [],
    );

    return (
        <div className="toast-queue" onAnimationEnd={onAnimationEnd}>
            {toastQueue.map((toast) => {
                const badge = (() => {
                    switch (toast.type) {
                        case "info":
                            return <InfoSVG />;
                        case "success":
                            return <CheckSVG />;
                        case "warning":
                            return <ProblemSVG />;
                    }
                })();
                return (
                    <section className="toast" key={toast.id}>
                        <section className={`toast-badge toast-${toast.type}`}>
                            {badge}
                        </section>
                        <section className="toast-text">{toast.text}</section>
                    </section>
                );
            })}
        </div>
    );
};
