import { convertTimeToTag } from "../hooks/useLrc.js";
import {
    AudioActionType,
    audioRef,
    AudioState,
    audioStatePubSub,
    currentTimePubSub,
} from "../utils/audiomodule.js";
import { loadAudioDialogRef } from "./loadaudio.js";
import {
    Forward5sSVG,
    LoadAudioSVG,
    PauseSVG,
    PlaySVG,
    Replay5sSVG,
} from "./svg.js";

const { useState, useEffect, useRef, useCallback, useMemo } = React;

interface ISliderProps {
    min: number;
    max: number;
    step?: string | number;
    value: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className: string;
}

const Slider: React.FC<ISliderProps> = ({
    min,
    max,
    step,
    value,
    onChange,
    className,
}) => {
    const total = max - min || 1;
    const percent = (value - min) / total;

    return (
        <div className={`slider ${className}-slider`}>
            <progress value={percent} />
            <input
                type="range"
                className={className}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

const TimeLine: React.FC<{ duration: number; paused: boolean }> = ({
    duration,
    paused,
}) => {
    const self = useRef(Symbol(TimeLine.name));
    const [currentTime, setCurrentTime] = useState(audioRef.currentTime);
    const [rate, setRate] = useState(audioRef.playbackRate);

    useEffect(() => {
        audioStatePubSub.sub(self.current, (data) => {
            if (data.type === AudioActionType.rateChange) {
                setRate(data.payload);
            }
        });

        return () => {
            audioStatePubSub.unsub(self.current);
        };
    }, []);

    useEffect(() => {
        if (paused) {
            // paused but user changing the time
            currentTimePubSub.sub(self.current, (data) => {
                setCurrentTime(data);
            });

            return () => {
                currentTimePubSub.unsub(self.current);
            };
        } else {
            const id = setInterval(() => {
                setCurrentTime(audioRef.currentTime);
            }, 500 / rate);

            return () => {
                clearInterval(id);
            };
        }
    }, [paused, rate]);

    const rafId = useRef(0);

    const onChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }

        const value = ev.target.value;

        rafId.current = requestAnimationFrame(() => {
            const time = Number.parseInt(value, 0);
            setCurrentTime(time);
            audioRef.currentTime = time;
        });
    }, []);

    const durationTimeTag = useMemo(() => {
        return duration ? " / " + convertTimeToTag(duration, 0, false) : false;
    }, [duration]);

    return (
        <>
            <time>
                {convertTimeToTag(currentTime, 0, false)}
                {durationTimeTag}
            </time>

            <Slider
                min={0}
                max={duration}
                step={1}
                value={currentTime}
                className="time-line"
                onChange={onChange}
            />
        </>
    );
};

const RateSlider: React.FC<{ lang: Language }> = ({ lang }) => {
    const self = useRef(Symbol(RateSlider.name));

    const [playbackRate, setPlaybackRate] = useState(audioRef.playbackRate);

    useEffect(() => {
        audioStatePubSub.sub(self.current, (data: AudioState) => {
            if (data.type === AudioActionType.rateChange) {
                setPlaybackRate(data.payload);
            }
        });

        return () => {
            audioStatePubSub.unsub(self.current);
        };
    }, []);

    // playbackRate: [1/e, e]
    // playbackRateSliderValue: [-1, 1]
    // playbackRateSliderValue === ln(playbackRate)
    // playbackRate === exp(playbackRateSliderValue)

    const playbackRateSliderValue = useMemo(() => {
        return Math.log(playbackRate);
    }, [playbackRate]);

    const onPlaybackRateSliderValueChanged = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            const value = Math.exp(Number.parseFloat(ev.target.value));
            setPlaybackRate(value);
            audioRef.playbackRate = value;
        },
        [],
    );

    const restPlaybackRate = useCallback(() => {
        audioRef.playbackRate = 1;
    }, []);

    return (
        <>
            <button
                className="ripple glow"
                title={lang.audio.resetRate}
                onClick={restPlaybackRate}>
                {"X "}
                {playbackRate.toFixed(2)}
            </button>

            <Slider
                className="playbackrate"
                min={-1}
                max={1}
                step="any"
                value={playbackRateSliderValue}
                onChange={onPlaybackRateSliderValueChanged}
            />
        </>
    );
};

export const LrcAudio: React.FC<{ lang: Language }> = ({ lang }) => {
    const self = useRef(Symbol(LrcAudio.name));

    const [paused, setPaused] = useState(audioRef.paused);

    const [duration, setDuration] = useState(audioRef.duration);

    useEffect(() => {
        audioStatePubSub.sub(self.current, (data: AudioState) => {
            switch (data.type) {
                case AudioActionType.getDuration: {
                    setDuration(data.payload);
                    setPaused(audioRef.paused);
                    break;
                }
                case AudioActionType.pause: {
                    setPaused(data.payload);
                    break;
                }
            }
        });

        return () => {
            audioStatePubSub.unsub(self.current);
        };
    }, []);

    const replay5s = useCallback(() => {
        audioRef.currentTime -= 5;
    }, []);

    const forward5s = useCallback(() => {
        audioRef.currentTime += 5;
    }, []);

    const togglePlayPause = useCallback(() => {
        audioRef.toggle();
    }, []);

    const loadAudioButtonClick = useCallback(() => {
        loadAudioDialogRef.showModal();
    }, []);

    return (
        <section className={"lrc-audio" + (paused ? "" : " playing")}>
            <button
                className="ripple glow loadaudio-button"
                title={lang.audio.loadAudio}
                onClick={loadAudioButtonClick}>
                <LoadAudioSVG />
            </button>
            <button
                className="ripple glow"
                title={lang.audio.replay5s}
                onClick={replay5s}
                disabled={!duration}>
                <Replay5sSVG />
            </button>
            <button
                className="ripple glow"
                title={paused ? lang.audio.play : lang.audio.pause}
                disabled={!duration}
                onClick={togglePlayPause}>
                {paused ? <PlaySVG /> : <PauseSVG />}
            </button>
            <button
                className="ripple glow"
                title={lang.audio.forward5s}
                onClick={forward5s}
                disabled={!duration}>
                <Forward5sSVG />
            </button>

            <TimeLine duration={duration} paused={paused} />
            <RateSlider lang={lang} />
        </section>
    );
};
