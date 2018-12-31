export const createPubSub = <DT, ID = any>() => {
    type CB = (data: DT) => any;
    const bus = new Map<ID, CB>();

    const pub = (data: DT) => {
        Array.from(bus.values()).forEach((cb: CB) => cb(data));
    };
    const sub = (id: ID, cb: CB) => {
        bus.set(id, cb);
    };
    const unsub = (id: ID) => {
        bus.delete(id);
    };

    return { pub, sub, unsub };
};
