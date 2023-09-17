import { convertTimeToTag } from "@lrc-maker/lrc-parser";
import { useEffect, useRef, useState } from "react";
import { AudioActionType, audioRef, audioStatePubSub, currentTimePubSub } from "../utils/audiomodule.js";

interface ICurserProps {
    fixed: Fixed;
}

export const Curser: React.FC<ICurserProps> = ({ fixed }) => {
    const self = useRef(Symbol(Curser.name));

    const [time, setTime] = useState(audioRef.currentTime);
    const [paused, setPaused] = useState(audioRef.paused);
    const [rate, setRate] = useState(audioRef.playbackRate);

    useEffect(() => {
        return audioStatePubSub.sub(self.current, (data) => {
            switch (data.type) {
                case AudioActionType.pause: {
                    setPaused(data.payload);
                    break;
                }
                case AudioActionType.rateChange: {
                    setRate(data.payload);
                    break;
                }
            }
        });
    }, []);

    useEffect(() => {
        //
        // Nyquist–Shannon sampling theorem
        //
        // If a function x(t) contains no frequencies higher than B hertz,
        // it is completely determined by giving its ordinates at a series
        // of points spaced 1/(2B) seconds apart.
        //

        const B = [1, 10, 100, 1000][fixed] * rate;

        if (paused || 2 * B > 60 /** 60fps */) {
            return currentTimePubSub.sub(self.current, (date) => {
                setTime(date);
            });
        } else {
            const id = setInterval(
                () => {
                    setTime(audioRef.currentTime);
                },
                1000 / (2 * B),
            );

            return (): void => {
                clearInterval(id);
            };
        }
    }, [fixed, paused, rate]);

    return <time className="curser">{convertTimeToTag(time, fixed)}</time>;
};
