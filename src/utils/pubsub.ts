export const createPubSub = <DT, ID = unknown>() => {
    type CB = (data: DT) => any;
    const bus = new Map<ID, CB>();

    const pub = (data: DT) => {
        bus.forEach((cb: CB) => cb(data));
    };
    const sub = (id: ID, cb: CB) => {
        bus.set(id, cb);
    };
    const unsub = (id: ID) => {
        bus.delete(id);
    };

    return { pub, sub, unsub };
};
