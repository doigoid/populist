(function() {
  var Populist, populist;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Populist = (function() {
    function Populist() {
      this.renderRequestItem = __bind(this.renderRequestItem, this);
      this.onVote = __bind(this.onVote, this);
      this.onRequest = __bind(this.onRequest, this);
      this.onPlayerEnd = __bind(this.onPlayerEnd, this);      this.username = prompt("Your name?");
      this.player = new Player($("#player"));
      this.player.audio.bind('ended', this.onPlayerEnd);
      this.backends = {
        requests: new Firebase('http://gamma.firebase.com/populist/tracks'),
        chat: new Firebase('http://gamma.firebase.com/populist/chat')
      };
      this.playlist = $('.requests');
      this.backends.requests.on('value', this.onRequest);
    }
    Populist.prototype.onPlayerEnd = function(event) {
      var nextTrack;
      console.log("ended");
      nextTrack = this.player.playlist[0];
      if (nextTrack === this.player.nowPlaying) {
        this.backends.requests.child(nextTrack.id).remove();
        nextTrack = this.player.playlist[0];
      }
      this.player.nowPlaying = nextTrack;
      this.player.loadSong(nextTrack);
      return this.player.play();
    };
    Populist.prototype.onRequest = function(requestQueue) {
      var id, playlist, requests, track, _ref;
      this.playlist.html("");
      requests = requestQueue.val();
      playlist = [];
      _ref = requestQueue.val();
      for (id in _ref) {
        track = _ref[id];
        this.renderRequestItem(id, track);
        playlist.push({
          id: id,
          title: track.title,
          artist: track.artist,
          url: track.url
        });
      }
      this.player.playlist = playlist.reverse();
      if (!this.player.playing) {
        this.player.nowPlaying = playlist[0];
        this.player.loadSong(playlist[0]);
        return this.player.play();
      }
    };
    Populist.prototype.onVote = function(event) {
      var id, track;
      event.preventDefault();
      $(event.currentTarget).hide();
      id = $(event.currentTarget).closest('li').attr('id');
      track = this.backends.requests.child(id);
      track.child('voters').push(this.username);
      return track.child('votes').transaction(function(votes) {
        return votes + 1;
      }, function(success, snapshot) {
        return track.setPriority(parseInt(snapshot.val(), 10));
      });
    };
    Populist.prototype.renderRequestItem = function(id, track) {
      var duration, id, requestItem, seconds, user, voters;
      seconds = parseInt(track.duration, 10);
      duration = "" + (Math.floor(seconds / 60)) + ":" + (seconds % 60);
      requestItem = $("<li id='" + id + "' class='request clearfix'>\n    <div class='controls clearfix'>\n        <a href='javascript:void 0;' class='vote-up'></a>\n        <a href='javascript:void 0;' class='vote-down'></a>\n        <div class='votes'>" + track.votes + "</div>\n    </div>\n    <h4 class='title'>\n        <span class='artist'>" + track.artist + "</span> - <span class='track'>" + track.title + "</span>\n    </h4>\n    <div class='duration'>" + duration + "</div>\n</li>");
      voters = (function() {
        var _ref, _results;
        _ref = track.voters;
        _results = [];
        for (id in _ref) {
          user = _ref[id];
          _results.push(user);
        }
        return _results;
      })();
      if (voters.indexOf(this.username) !== -1) {
        requestItem.find('.controls').css('visibility', 'hidden');
      }
      requestItem.find('.vote-up').click(this.onVote);
      return this.playlist.prepend(requestItem);
    };
    return Populist;
  })();
  populist = null;
  $(function() {
    return window.populist = new Populist;
  });
}).call(this);
