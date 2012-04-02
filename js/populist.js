(function() {
  var Populist, echonest, populist;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  echonest = new EchoNest("B2DH7MOZ0PWGKE2AM");
  Populist = (function() {
    function Populist() {
      this.renderRequestItem = __bind(this.renderRequestItem, this);
      this.renderSearchResult = __bind(this.renderSearchResult, this);
      this.addRequest = __bind(this.addRequest, this);
      this.search = __bind(this.search, this);
      this.onVote = __bind(this.onVote, this);
      this.playSong = __bind(this.playSong, this);
      this.onRequest = __bind(this.onRequest, this);
      this.onPlayerEnd = __bind(this.onPlayerEnd, this);      this.username = prompt("Your name?", "Unnamed");
      this.player = new Player($("#player"), []);
      this.player.audio.bind('ended', this.onPlayerEnd);
      this.backend = new Firebase('http://gamma.firebase.com/populist/');
      this.playlist = $('.requests');
      this.results = $('.make-request-results');
      $("#request-input").keypress(__bind(function(e) {
        if (e.keyCode === 13) {
          return this.search(e);
        }
      }, this));
      this.backend.child('tracks').on('value', this.onRequest);
    }
    Populist.prototype.onPlayerEnd = function(event) {
      var nextTrack;
      this.player.playing = false;
      nextTrack = this.player.playlist[0];
      if (nextTrack === void 0) {
        return;
      }
      if (nextTrack === this.player.nowPlaying) {
        this.backend.child('tracks/' + nextTrack.id).remove();
        nextTrack = this.player.playlist[0];
      }
      return this.playSong(nextTrack);
    };
    Populist.prototype.onRequest = function(requestQueue) {
      var id, playlist, requests, track, _ref;
      this.playlist.html("");
      requests = requestQueue.val();
      playlist = [];
      _ref = requestQueue.val();
      for (id in _ref) {
        track = _ref[id];
        if (!this.player.playing || this.player.nowPlaying.id !== id) {
          this.renderRequestItem(id, track);
          playlist.push({
            id: id,
            title: track.title,
            artist: track.artist,
            url: track.url
          });
        }
      }
      this.player.playlist = playlist.reverse();
      if (!this.player.playing && playlist.length) {
        return this.playSong(playlist[0]);
      }
    };
    Populist.prototype.playSong = function(track) {
      this.player.nowPlaying = track;
      this.player.loadSong(track);
      this.player.play();
      return this.playlist.find("#" + track.id).fadeOut();
    };
    Populist.prototype.onVote = function(event) {
      var id, track;
      event.preventDefault();
      $(event.currentTarget).hide();
      id = $(event.currentTarget).closest('li').attr('id');
      track = this.backend.child('tracks').child(id);
      track.child('voters').push(this.username);
      return track.child('votes').transaction(function(votes) {
        return votes + 1;
      }, function(success, snapshot) {
        return track.setPriority(parseInt(snapshot.val(), 10));
      });
    };
    Populist.prototype.search = function(event) {
      var query;
      this.results.html("<p align='center'>Searching...</p>");
      query = $('#request-input').val();
      return echonest.artist(query).audio(__bind(function(tracks) {
        var t, _i, _len, _ref, _results;
        this.results.html("");
        _ref = tracks.data.audio;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          t = _ref[_i];
          _results.push(this.renderSearchResult(t));
        }
        return _results;
      }, this));
    };
    Populist.prototype.addRequest = function(id, url, artist, title, length) {
      var ref;
      ref = this.backend.child('tracks').push();
      ref.setWithPriority({
        id: id,
        url: url,
        artist: artist,
        title: title,
        duration: length,
        votes: 1
      }, -1);
      return this.results.html("");
    };
    Populist.prototype.renderSearchResult = function(track) {
      var searchResult;
      searchResult = $("<div id='" + track.id + "'>\n    <a href='" + track.url + "'>\n        <img src='img/icon-add.png' />\n        <strong>" + track.artist + "</strong> &mdash; " + track.title + "\n    </a>\n</div>");
      searchResult.find('a').click(__bind(function(event) {
        event.preventDefault();
        return this.addRequest(track.id, track.url, track.artist, track.title, track.length);
      }, this));
      return this.results.append(searchResult);
    };
    Populist.prototype.renderRequestItem = function(id, track) {
      var duration, id, requestItem, seconds, user, voters;
      seconds = parseInt(track.duration, 10);
      duration = "" + (Math.floor(seconds / 60)) + ":" + (seconds % 60);
      requestItem = $("        <li id='" + id + "' class='request clearfix'>\n            <div class='controls clearfix'>\n                <a href='javascript:void 0;' class='vote-up'></a>\n                <a href='javascript:void 0;' class='vote-down'></a>\n                <div class='votes'>" + track.votes + "</div>\n            </div>\n            <h4 class='title'>\n                <span class='artist'>" + track.artist + "</span> -\n<span class='track'>" + track.title + "</span>\n            </h4>\n            <div class='duration'>" + duration + "</div>\n        </li>");
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
