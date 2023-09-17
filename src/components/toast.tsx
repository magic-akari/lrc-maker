import { useCallback, useEffect, useRef, useState } from "react";
import { createPubSub } from "../utils/pubsub.js";
import { CheckSVG, InfoSVG, ProblemSVG } from "./svg.js";

type MessageType = "info" | "success" | "warning";

interface IMessage {
    type: MessageType;
    text: string;
}

export const toastPubSub = createPubSub<IMessage>();

const box = { id: 0 };

export const Toast: React.FC = () => {
    const self = useRef(Symbol(Toast.name));

    interface IToast extends IMessage {
        id: number;
    }

    const [toastQueue, setToastQueue] = useState<IToast[]>([]);

    useEffect(() => {
        return toastPubSub.sub(self.current, (data) => {
            setToastQueue((queue) => [{ id: box.id++, ...data }, ...queue]);
        });
    }, []);

    const onAnimationEnd = useCallback((ev: React.AnimationEvent<HTMLElement>) => {
        if (ev.animationName === "slide-out-right") {
            setToastQueue((queue) => queue.slice(0, -1));
        }
    }, []);

    const ToastIter = useCallback((toast: IToast) => {
        const badge = {
            info: <InfoSVG />,
            success: <CheckSVG />,
            warning: <ProblemSVG />,
        }[toast.type];

        return (
            <section className="toast" key={toast.id}>
                <section className={`toast-badge toast-${toast.type}`}>{badge}</section>
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
