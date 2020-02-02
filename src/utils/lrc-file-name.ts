const filenamify = (name: string): string => {
    return name.replace(/[<>:"/\\|?*]/g, "_").trim();
};

export const lrcFileName = (lrcInfo: Map<string, string>): string => {
    const list = [lrcInfo.get("ti"), lrcInfo.get("ar")].filter((v) => !!v);

    if (list.length === 0) {
        if (lrcInfo.has("al")) {
            list.push(lrcInfo.get("al"));
        }
        list.push(new Date().toLocaleString());
    }
    return (list as string[]).map((name) => filenamify(name)).join(" - ") + ".lrc";
};
