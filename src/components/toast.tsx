import { createPubSub } from "../utils/pubsub.js";
import { CheckSVG, InfoSVG, ProblemSVG } from "./svg.js";

type MessageType = "info" | "success" | "warning";

interface IMessage {
    type: MessageType;
    text: string;
}

export const toastPubSub = createPubSub<IMessage>();

const { useCallback, useEffect, useMemo, useRef, useState } = React;

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

    const ToastIter = useCallback((toast: IToast) => {
        const badge = {
            info: <InfoSVG />,
            success: <CheckSVG />,
            warning: <ProblemSVG />,
        }[toast.type];

        return (
            <section className="toast" key={toast.id}>
                <section className={`toast-badge toast-${toast.type}`}>
                    {badge}
                </section>
                <section className="toast-text">{toast.text}</section>
            </section>
        );
    }, []);

    return (
        <div className="toast-queue" onAnimationEnd={onAnimationEnd}>
            {toastQueue.map(ToastIter)}
        </div>
    );
};
