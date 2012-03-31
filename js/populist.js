(function() {
  var Populist;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Populist = (function() {
    function Populist() {
      this.renderRequestItem = __bind(this.renderRequestItem, this);
      this.onVote = __bind(this.onVote, this);
      this.onRequest = __bind(this.onRequest, this);      this.username = prompt("Your name?");
      this.backends = {
        requests: new Firebase('http://gamma.firebase.com/populist/tracks'),
        chat: new Firebase('http://gamma.firebase.com/populist/chat')
      };
      this.playlist = $('.requests');
      this.queue = {};
      this.backends.requests.on('value', this.onRequest);
    }
    Populist.prototype.onRequest = function(requestQueue) {
      var id, requests, track, _ref, _results;
      this.playlist.html("");
      requests = requestQueue.val();
      _ref = requestQueue.val();
      _results = [];
      for (id in _ref) {
        track = _ref[id];
        _results.push(this.renderRequestItem(id, track));
      }
      return _results;
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
      requestItem = $("<li id='" + id + "' class='request clearfix'>\n    <div class='controls clearfix'>\n        <a href='javascript:void 0;' class='vote-up'></a>\n        <a href='javascript:void 0;' class='vote-down'></a>\n    </div>\n    <h4 class='title'>\n        <span class='artist'>" + track.artist + "</span> - <span class='track'>" + track.title + "</span>\n    </h4>\n    <div class='duration'>" + duration + "</div>\n</li>");
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
  $(function() {
    var populist;
    return populist = new Populist;
  });
}).call(this);
