/**
 * Created by akari on 22/02/2017.
 */
(function () {
    var capture = /song\?id=(\d{4,})/.exec(location.hash);
    if (capture) {
        var id = capture[1];
        var logList = JSON.parse(localStorage.getItem('local-log'));
        var index = logList.findIndex(function (l) {
                return l.match(id)
            }) - 1;
        console.log(index);
        if (index < 0) {
            alert('未找到该歌曲的播放记录，请先播放该歌曲。');
            return;
        }
        var mp3url = logList[index].match(/mp3: (.*\.mp3)/)[1];
        console.log('mp3', mp3url);
        if (confirm('已找到mp3缓存，点击确定将跳转至歌词制作页面')) {
            location.href = '//hufan-akari.github.io/LRC-MAKER/?audiosrc=' + mp3url;
        }
    } else {
        alert('请在单曲页面使用本脚本。');
    }
})();