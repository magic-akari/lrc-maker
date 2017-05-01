/**
 * Created by akari on 22/02/2017.
 */
(function() {
  if (location.hostname === "music.163.com") {
    var track = window.player.getPlaying().track;
    var id = track.id;
    var ti = track.name;
    var ar = track.artists
      .map(function(a) {
        return a.name;
      })
      .join("/");
    var al = track.album.name;
    var logList = JSON.parse(localStorage.getItem("local-log"));
    var index = logList.findIndex(function(l) {
      return l.match(id);
    }) - 1;
    console.log(index);
    if (index < 0) {
      alert("未找到该歌曲的播放记录，请先播放该歌曲。");
      return;
    }
    var mp3url = logList[index].match(/mp3: (.*\.mp3)/)[1];
    console.log("mp3", mp3url);
    if (confirm("已找到mp3缓存，点击确定将跳转至歌词制作页面")) {
      var sp = new URLSearchParams();
      sp.append("audiosrc", mp3url);
      sp.append("ti", ti);
      sp.append("ar", ar);
      sp.append("al", al);
      sp.append("id", id);
      location.href = "https://hufan-akari.github.io/LRC-MAKER/?" +
        sp.toString();
    }
  } else {
    alert("请在云音乐网页使用");
  }
})();
