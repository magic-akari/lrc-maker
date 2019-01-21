// tslint:disable:no-bitwise
declare const self: DedicatedWorkerGlobalScope;
export {};

const CORE_KEY = Uint8Array.of(
    0x68,
    0x7a,
    0x48,
    0x52,
    0x41,
    0x6d,
    0x73,
    0x6f,
    0x35,
    0x6b,
    0x49,
    0x6e,
    0x62,
    0x61,
    0x78,
    0x57,
);

const AES_ECB_DECRYPT = async (keyData: Uint8Array, data: Uint8Array) => {
    const AES = {
        name: "AES-CBC",
        iv: new Uint8Array(16),
    };

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        "AES-CBC",
        false,
        ["encrypt", "decrypt"],
    );

    const bodyLength = data.byteLength - 16;

    const tailBlock = data.slice(bodyLength);

    const deTailBlock = await crypto.subtle.decrypt(AES, cryptoKey, tailBlock);

    const decrypted = new Uint8Array(bodyLength + deTailBlock.byteLength);

    decrypted.set(new Uint8Array(deTailBlock), bodyLength);

    const padding = new Uint8Array(16);
    padding.fill(16);
    const concated = new Uint8Array(32);

    for (let curser = 0; curser < bodyLength; curser += 16) {
        const clip = data.slice(curser, curser + 16);

        const encryptedPadding = await crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: clip,
            },
            cryptoKey,
            padding,
        );

        concated.set(clip, 0);
        concated.set(new Uint8Array(encryptedPadding).slice(0, 16), 16);

        const result = await crypto.subtle.decrypt(
            { name: "AES-CBC", iv: new ArrayBuffer(16) },
            cryptoKey,
            concated,
        );
        decrypted.set(new Uint8Array(result), curser);
    }

    return decrypted;
};

self.addEventListener("message", async (ev) => {
    const filebuffer: ArrayBuffer = ev.data;
    const dataview = new DataView(ev.data);

    if (
        dataview.getUint32(0, true) !== 0x4e455443 ||
        dataview.getUint32(4, true) !== 0x4d414446
    ) {
        self.postMessage({ type: "error", data: "not ncm file" });
        self.close();
    }

    let offset = 10;

    const keyBox = await (async () => {
        const keyLen = dataview.getUint32(offset, true);
        offset += 4;
        let keyDate = new Uint8Array(filebuffer, offset, keyLen).map(
            (data) => data ^ 0x64,
        );
        offset += keyLen;

        keyDate = (await AES_ECB_DECRYPT(CORE_KEY, keyDate)).slice(17);

        let box = new Uint8Array(Array.from(Array(256).keys()));

        {
            const deKeyLen = keyDate.length;

            let j = 0;

            for (let i = 0; i < 256; i++) {
                j = (box[i] + j + keyDate[i % deKeyLen]) & 0xff;
                [box[i], box[j]] = [box[j], box[i]];
            }

            box = box.map(
                (item, i, arr) => arr[(item + arr[(item + i) & 0xff]) & 0xff],
            );
        }

        return box;
    })();

    {
        offset += dataview.getUint32(offset, true) + 4;
        offset += dataview.getUint32(offset + 5, true) + 13;
    }

    const decryptedData = new Uint8Array(filebuffer, offset);

    // workaround for Firefox which async function causes performance problems
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1521435
    (() => {
        const decryptedDataLength = decryptedData.length;
        const step = 0x8000;
        const tailLength = decryptedDataLength % step;
        const bodyLength = decryptedDataLength - tailLength;

        console.time("decryptedFile");

        for (let index = 0; index < bodyLength; index += step) {
            for (let cur = 0; cur < step; cur++) {
                decryptedData[index + cur] ^= keyBox[(cur + 1) & 0xff];
            }
        }

        for (let cur = 0; cur < tailLength; cur++) {
            decryptedData[bodyLength + cur] ^= keyBox[(cur + 1) & 0xff];
        }

        console.timeEnd("decryptedFile");
    })();

    let mimeType = "audio/mpeg";

    if (
        new DataView(decryptedData.buffer).getUint32(0, true) ===
        0x664c6143 /** fLaC */
    ) {
        mimeType = "audio/flac";
    }

    self.postMessage(
        { type: "url", dataArray: decryptedData, mime: mimeType },
        [decryptedData.buffer],
    );
    self.close();
});
