import { createPubSub } from "./pubsub.js";

interface IAudioRef extends React.RefObject<HTMLAudioElement> {
    readonly src: string;
    readonly duration: number;
    readonly paused: boolean;
    playbackRate: number;
    currentTime: number;
    toggle: () => void;
}

export const audioRef: IAudioRef = {
    current: null,

    get src() {
        return this.current?.src ?? "";
    },

    get duration() {
        return this.current?.duration ?? 0;
    },

    get paused() {
        return this.current?.paused ?? true;
    },

    get playbackRate() {
        return this.current?.playbackRate ?? 1;
    },
    set playbackRate(rate: number) {
        if (this.current !== null) {
            this.current.playbackRate = rate;
        }
    },

    get currentTime() {
        return this.current?.currentTime ?? 0;
    },
    set currentTime(time: number) {
        if (this.current !== null && this.current.duration !== 0) {
            this.current.currentTime = time;
        }
    },

    toggle() {
        if (this.current?.duration) {
            this.current.paused ? this.current.play() : this.current.pause();
        }
    },
};

export const enum AudioActionType {
    pause,
    getDuration,
    rateChange,
}

export type AudioState =
    | {
          type: AudioActionType.pause;
          payload: boolean;
      }
    | {
          type: AudioActionType.getDuration;
          payload: number;
      }
    | {
          type: AudioActionType.rateChange;
          payload: number;
      };

export const audioStatePubSub = createPubSub<AudioState>();
export const currentTimePubSub = createPubSub<number>();
