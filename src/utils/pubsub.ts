export const createPubSub = <DT, ID = unknown>() => {
    type CB = (data: DT) => void;
    const bus = new Map<ID, CB>();

    const pub = (data: DT): void => {
        bus.forEach((cb: CB) => {
            cb(data);
        });
    };
    const sub = (id: ID, cb: CB): () => void => {
        bus.set(id, cb);

        return (): void => {
            bus.delete(id);
        };
    };

    return { pub, sub };
};
