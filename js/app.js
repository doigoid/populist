(function() {
  var AppView, Message, MessageList, MessageView, Player, Request, RequestList, RequestView, Track, TrackList, TrackView, echonest, messageView, requestView, trackView,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  echonest = new EchoNest("B2DH7MOZ0PWGKE2AM");

  Player = (function(_super) {

    __extends(Player, _super);

    function Player() {
      Player.__super__.constructor.apply(this, arguments);
    }

    return Player;

  })(Emitter);

  Request = (function(_super) {

    __extends(Request, _super);

    function Request() {
      Request.__super__.constructor.apply(this, arguments);
    }

    return Request;

  })(Backbone.Model);

  Track = (function(_super) {

    __extends(Track, _super);

    function Track() {
      Track.__super__.constructor.apply(this, arguments);
    }

    return Track;

  })(Backbone.Model);

  Message = (function(_super) {

    __extends(Message, _super);

    function Message() {
      Message.__super__.constructor.apply(this, arguments);
    }

    return Message;

  })(Backbone.Model);

  RequestList = (function(_super) {

    __extends(RequestList, _super);

    function RequestList() {
      RequestList.__super__.constructor.apply(this, arguments);
    }

    RequestList.prototype.model = Request;

    return RequestList;

  })(Backbone.Collection);

  TrackList = (function(_super) {

    __extends(TrackList, _super);

    function TrackList() {
      TrackList.__super__.constructor.apply(this, arguments);
    }

    TrackList.prototype.model = Track;

    return TrackList;

  })(Backbone.Collection);

  MessageList = (function(_super) {

    __extends(MessageList, _super);

    function MessageList() {
      MessageList.__super__.constructor.apply(this, arguments);
    }

    MessageList.prototype.model = Message;

    return MessageList;

  })(Backbone.Collection);

  RequestView = (function(_super) {

    __extends(RequestView, _super);

    function RequestView() {
      this.updateOnEnter = __bind(this.updateOnEnter, this);
      RequestView.__super__.constructor.apply(this, arguments);
    }

    RequestView.prototype.template = _.template($("#request-template").html());

    RequestView.prototype.events = {
      "keypress .request-input": "updateOnEnter"
    };

    RequestView.prototype.updateOnEnter = function(event) {
      if (event.keyCode === 13) return console.log(this);
    };

    return RequestView;

  })(Backbone.View);

  TrackView = (function(_super) {

    __extends(TrackView, _super);

    function TrackView() {
      TrackView.__super__.constructor.apply(this, arguments);
    }

    TrackView.prototype.template = _.template($("#track-template").html());

    TrackView.prototype.events = {
      "click .vote.up": "voteUp",
      "click .vote.down": "voteDown"
    };

    TrackView.prototype.voteUp = function(event) {
      return console.log(this);
    };

    TrackView.prototype.voteDown = function(event) {
      return console.log(this);
    };

    return TrackView;

  })(Backbone.View);

  MessageView = (function(_super) {

    __extends(MessageView, _super);

    function MessageView() {
      MessageView.__super__.constructor.apply(this, arguments);
    }

    MessageView.prototype.template = _.template($("#message-template").html());

    MessageView.prototype.events = {
      "keypress .message-input": "updateOnEnter"
    };

    MessageView.prototype.updateOnEnter = function() {
      return console.log(this);
    };

    return MessageView;

  })(Backbone.View);

  AppView = (function(_super) {

    __extends(AppView, _super);

    function AppView() {
      AppView.__super__.constructor.apply(this, arguments);
    }

    return AppView;

  })(Backbone.View);

  requestView = new RequestView();

  trackView = new TrackView();

  messageView = new MessageView();

}).call(this);
