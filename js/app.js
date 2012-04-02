
var Player = (function() {
    var $audio = $('<audio />'),
    player = null,
    loadedBar = null,
    progressBar = null,
    title = null,
    actionBtn = null;

  function _handleAudioEvents(e) {
    //console.log(e.type, e);
    if(e.type === "canplay") {
      this.play();
    }
    if(e.type === "timeupdate") {
      progressBar.css({width: Math.floor(($audio[0].currentTime/$audio[0].duration)*100)+"%"});
      loadedBar.css({width: Math.floor(($audio[0].buffered.end($audio[0].buffered.length-1)/$audio[0].duration)*100)+"%"});
    }
  }
  function Player(el, pl) {
    player = el;
    loadedBar = player.find('.loaded');
    progressBar = player.find('.progress');
    title = player.parent().find('.title');
    actionBtn = player.find('#playerBtn');
    this.playlist = pl;
	this.playing = false;
    actionBtn.bind('click touchstart', function() {
      if($audio[0].paused) {
        $audio[0].play();
      } else {
        $audio[0].pause();
      }
    });
	this.audio = $($audio[0]);
  }
  Player.prototype.play = function() {
	this.playing = true;
    $audio[0].play();
  };
  Player.prototype.pause = function() {
	this.playing = false;
    $audio[0].pause();
  };
  Player.prototype.loadSong = function(track) {
    $audio.attr('src', track.url);
    title.html('<span class="artist">'+track.artist+'</span> - <span class="text">'+track.title+'</span>');
  };

  $audio.bind('abort canplay canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting', _handleAudioEvents);

  return Player;
})();

function openChat() {
  document.body.className = (document.body.className === "chat-open") ? "" : "chat-open";
}

function tellMe(e) {
	//console.log(e.type);
}
