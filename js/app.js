(function() {
  var $body, Chat, Player, Populist, echonest, emitter, firebase, helpers, populist,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $body = $(document.body);

  echonest = new EchoNest("B2DH7MOZ0PWGKE2AM");

  emitter = new Emitter();

  firebase = new Firebase("http://gamma.firebase.com/populist/");

  helpers = {
    sanitizeInput: function(string) {
      return string.replace(/(<([^>]+)>)/ig, "");
    },
    formatTime: function(date) {
      var ap, d, h, m;
      d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
      ap = (h = d.getHours()) < 12 ? "AM" : "PM";
      h = h > 12 ? h - 12 : h;
      h = h === 0 ? 12 : h;
      m = (m = d.getMinutes()) > 10 ? m : "0" + m;
      return "" + h + ":" + m + " " + ap;
    },
    canPlayAudio: function(url, callback) {
      var audio;
      try {
        audio = new Audio();
        if (audio.canPlayType("audio/mpeg") !== "no") callback(true);
        audio.oncanplaythrough = function(event) {
          callback(true);
        };
        audio.onerror = function(event) {
          callback(false, this.error);
        };
        audio.src = url;
        audio.load();
      } catch (error) {
        callback(false, error);
      }
    }
  };

  Player = (function() {
    var $audio;

    $audio = $("<audio />");

    function Player() {
      this.currentTrack = firebase.child("current_track");
      this.tracks = firebase.child("tracks");
      this.tracks.on("child_added", this.getTracks);
    }

    Player.prototype.play = function() {
      $audio[0].play();
      return emitter.emit("Player::play");
    };

    Player.prototype.pause = function() {
      $audio[0].pause();
      return emitter.emit("Player::pause");
    };

    Player.prototype.getTracks = function(snapshot) {
      return emitter.emit("Player::getTracks", snapshot.val());
    };

    return Player;

  })();

  Chat = (function() {
    var $chatInput, $messages;

    $chatInput = $("#chat-input");

    $messages = $(".messages");

    function Chat() {
      this.getMessages = __bind(this.getMessages, this);
      this.sendMessage = __bind(this.sendMessage, this);      this.user = null;
      this.presence = null;
      this.messages = firebase.child("messages");
      this.setUsername("What is your name?");
      this.messages.limit(100).on("child_added", this.getMessages);
      $chatInput.keypress(this.sendMessage);
    }

    Chat.prototype.setUsername = function(message) {
      var _this = this;
      this.user = prompt(message, "");
      this.presence = firebase.child("users/" + this.user + "/online");
      return this.presence.once("value", function(snapshot) {
        if (!snapshot.val()) {
          _this.presence.setOnDisconnect(false);
          _this.presence.set(true);
          return emitter.emit("Chat::setUsername", _this.user);
        } else {
          _this.setUsername("Please pick another username");
        }
      });
    };

    Chat.prototype.setMessage = function(user, text, timestamp) {
      $messages.prepend("<li class=\"message clearfix\">\n  <div class=\"timestamp\">" + timestamp + "</div>\n  <span class=\"user\">" + user + "</span>\n  <span class=\"text\">" + text + "</span>\n</li>");
    };

    Chat.prototype.sendMessage = function(event) {
      var message;
      if (event.keyCode === 13) {
        message = helpers.sanitizeInput($chatInput.val());
        this.messages.push({
          user: this.user,
          text: message,
          timestamp: +new Date()
        });
        $chatInput.val("");
        emitter.emit("Chat::sendMessage");
        return false;
      }
    };

    Chat.prototype.getMessages = function(snapshot) {
      var message;
      message = snapshot.val();
      this.setMessage(message.user, message.text, helpers.formatTime(message.timestamp));
      emitter.emit("Chat::getMessages");
    };

    Chat.prototype.toggleChat = function() {
      if ($body.hasClass("chat-open")) {
        $body.removeClass("chat-open");
      } else {
        $body.addClass("chat-open");
      }
    };

    return Chat;

  })();

  Populist = (function() {
    var $chatBtn, $requestInput, $results, $tracks, $username;

    $chatBtn = $("#chat-button");

    $username = $("#username");

    $tracks = $(".requests");

    $results = $(".make-request-results");

    $requestInput = $("#request-input");

    function Populist() {
      this.setSearchResult = __bind(this.setSearchResult, this);
      this.setRequest = __bind(this.setRequest, this);
      this.createRequest = __bind(this.createRequest, this);
      this.doSearch = __bind(this.doSearch, this);
      var _this = this;
      this.chat = new Chat();
      this.player = new Player();
      $username.click(function() {
        _this.chat.setUsername("What is your name?");
      });
      $chatBtn.click(function() {
        _this.chat.toggleChat();
      });
      emitter.on("Chat::setUsername", function(username) {
        $username.html(helpers.sanitizeInput(username));
      });
      emitter.on("Player::getTracks", this.setRequest);
      $requestInput.keypress(this.doSearch);
    }

    Populist.prototype.doSearch = function(event) {
      var query,
        _this = this;
      if (event.keyCode === 13) {
        $results.html("<p style='text-align:center;'>Searching...</p>");
        query = $('#request-input').val();
        echonest.artist(query).audio(function(tracks) {
          var track, _i, _len, _ref, _results;
          $results.html("");
          _ref = tracks.data.audio;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            track = _ref[_i];
            _results.push(_this.setSearchResult(track));
          }
          return _results;
        });
        return false;
      }
    };

    Populist.prototype.createRequest = function(track) {
      var _this = this;
      return helpers.canPlayAudio(track.url, function(canPlay, error) {
        if (canPlay) {
          _this.player.tracks.push().setWithPriority({
            id: track.id,
            url: track.url,
            artist: track.artist,
            title: track.title,
            duration: track.length,
            votes: 1,
            voters: [_this.chat.user]
          }, -1);
          $requestInput.val("");
          return $results.html("");
        } else {
          return alert("Sorry, this song won't play on our player.");
        }
      });
    };

    Populist.prototype.setRequest = function(track) {
      var duration, m, requestItem, s;
      console.log(track);
      s = parseInt(track.duration, 10);
      m = Math.floor(s / 60);
      s = ("0" + (s % 60)).slice(-2);
      duration = "" + m + ":" + s;
      requestItem = $("<li id='" + track.id + "' class='request clearfix'>\n    <h4 class='title'>\n        <span class='artist'>" + track.artist + "</span> -\n        <span class='track'>" + track.title + "</span>\n    </h4>\n    <div class='info clearfix'>\n      <div class='controls clearfix'>\n        <a href='javascript:void 0;' class='vote-up'></a>\n        <a href='javascript:void 0;' class='vote-down'></a>\n        <div class='votes'>" + track.votes + " Vote" + (track.votes > 1 ? 's' : '') + "</div>\n      </div>\n      <div class='duration'>" + duration + "</div>\n    </div>\n</li>");
      if (track.voters.indexOf(this.chat.user) !== -1) {
        requestItem.find(".controls").find("a").remove();
      }
      requestItem.find(".vote-down").click(this.onVote);
      requestItem.find(".vote-up").click(this.onVote);
      return $tracks.append(requestItem);
    };

    Populist.prototype.setSearchResult = function(track) {
      var searchResult,
        _this = this;
      searchResult = $("<div id='" + track.id + "'>\n    <a href='" + track.url + "'>\n        <img src='img/icon-add.png' />\n        <strong>" + track.artist + "</strong> &mdash; " + track.title + "\n    </a>\n</div>");
      searchResult.find('a').click(function(event) {
        event.preventDefault();
        return _this.createRequest(track);
      });
      return $results.prepend(searchResult);
    };

    return Populist;

  })();

  populist = new Populist();

}).call(this);
