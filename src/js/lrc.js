const LRC = {
    parse(text){
        let list = text.split(/\r\n|[\r\n]/);

        const time = /\[\d{1,2}:\d{1,2}([:.]\d{1,3})?]/g;
        let lyric = [];
        let ar, ti, al;
        const tag_and_text = /(\[.*])(.*)/;
        for (let line of list) {
            let result = tag_and_text.exec(line);
            if (result === null) {
                lyric.push({text: line.trim()})
            }
            else {
                let [_, tag, text] = result;
                let time_tags = tag.match(time);
                if (time_tags === null) {
                    // [ar:艺人名][ti:曲名][al:专辑名]
                    let _ar = tag.match(/\[ar:(.*)]/);
                    if (_ar !== null) {
                        ar = _ar[1];
                    }

                    let _ti = tag.match(/\[ti:(.*)]/);
                    if (_ti !== null) {
                        ti = _ti[1];
                    }

                    let _al = tag.match(/\[al:(.*)]/);
                    if (_al !== null) {
                        al = _al[1];
                    }
                }
                else {
                    for (let time_tag of time_tags) {
                        let [_, mm, ss] = time_tag.match(/\[(.*?):(.*)]/);
                        ss = ss.replace(/:/, '.');
                        [mm, ss] = [parseInt(mm), parseFloat(ss)];
                        lyric.push({time: mm * 60 + ss, text: text.trim()});
                    }
                }

            }
        }
        let [key, new_key] = [0, lyric.length];
        for (; key < new_key; ++key) {
            lyric[key].key = key;
        }

        return {ar, ti, al, lyric, new_key};

    },
    timeToTag(time){
        let m = Math.floor(time / 60);
        m = isNaN(m) ? '--' : ( m >= 10 ) ? m : '0' + m;
        let s = Math.floor(time % 60);
        s = isNaN(s) ? '--' : ( s >= 10 ) ? s : '0' + s;
        let ms = ((time - m * 60 - s) * 1000).toFixed(0);
        ms = isNaN(ms) ? '--' : ( ms >= 100 ) ? ms : ( ms > 10 ) ? '0' + ms : '00' + ms;
        return `[${m}:${s}.${ms}]`;
    },
    stringify(lrc){
        let textLines = ['[tool:灯里的歌词滚动姬]'];
        if (lrc.ar) {
            textLines.push(`[ar:${lrc.ar}]`);
        }
        if (lrc.ti) {
            textLines.push(`[ti:${lrc.ti}]`);
        }
        if (lrc.al) {
            textLines.push(`[ar:${lrc.al}]`);
        }
        for (let item of lrc.lyric) {
            if (item.time === undefined) {
                textLines.push(item.text);
            }
            else {
                textLines.push(`${this.timeToTag(item.time)} ${item.text}`);
            }
        }
        return textLines.join('\r\n');
    }
};

export default LRC;

