interface ISuccessData {
    type: "success";
    payload: Uint8Array;
}

interface IErrorData {
    type: "error";
    payload: string;
}

declare type IMessage = ISuccessData | IErrorData;

declare interface IMessageEvent<T = any> extends MessageEvent {
    readonly data: T;
}

declare interface DedicatedWorkerGlobalScope {
    postMessage<T = any>(message: T, transfer: Transferable[]): void;
    postMessage<T = any>(message: T, options?: StructuredSerializeOptions): void;
}
