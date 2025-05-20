import { useWavesurfer } from "@wavesurfer/react";
import { useEffect, useRef } from "react";
import { audioRef } from "../utils/audiomodule";
import "./waveform.css";

interface IWaveformProps {
    // time in seconds
    value: number;
    /**
     * @param time seconds
     */
    onSeek: (time: number) => void;
    className?: string;
}

export const Waveform: React.FC<IWaveformProps> = ({ value, onSeek, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const style = getComputedStyle(document.documentElement);
    const themeColor = style.getPropertyValue("--theme-color");
    const { wavesurfer } = useWavesurfer({
        container: containerRef,
        waveColor: "#eeeeee",
        progressColor: themeColor,
        cursorColor: themeColor,
        normalize: true,
        height: "auto",
        interact: true,
        dragToSeek: true,
    });

    // attach drag listener
    useEffect(() => {
        return wavesurfer?.on("interaction", (currentTime) => {
            onSeek(currentTime);
        });
    }, [wavesurfer, onSeek]);

    // Update the seekTo position when value prop changes
    useEffect(() => {
        wavesurfer?.setTime(value);
    }, [wavesurfer, value]);

    useEffect(() => {
        wavesurfer?.load(audioRef.src).then(() => {
            wavesurfer?.setTime(value);
        });
    }, [wavesurfer, audioRef.src]);

    return <div className={`waveform ${className || ""}`} ref={containerRef}></div>;
};
