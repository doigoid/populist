(function() {
  var Message, Messages, MessagesView, TodoApp, Track, Tracks, TracksView, User, Users, firebase,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  firebase = new Firebase('http://gamma.firebase.com/populist/');

  User = (function(_super) {

    __extends(User, _super);

    function User() {
      User.__super__.constructor.apply(this, arguments);
    }

    return User;

  })(Backbone.Model);

  Message = (function(_super) {

    __extends(Message, _super);

    function Message() {
      Message.__super__.constructor.apply(this, arguments);
    }

    return Message;

  })(Backbone.Model);

  Track = (function(_super) {

    __extends(Track, _super);

    function Track() {
      Track.__super__.constructor.apply(this, arguments);
    }

    return Track;

  })(Backbone.Model);

  Users = (function(_super) {

    __extends(Users, _super);

    function Users() {
      Users.__super__.constructor.apply(this, arguments);
    }

    Users.prototype.model = User;

    return Users;

  })(Backbone.Collection);

  Messages = (function(_super) {

    __extends(Messages, _super);

    function Messages() {
      Messages.__super__.constructor.apply(this, arguments);
    }

    Messages.prototype.model = Message;

    return Messages;

  })(Backbone.Collection);

  Tracks = (function(_super) {

    __extends(Tracks, _super);

    function Tracks() {
      Tracks.__super__.constructor.apply(this, arguments);
    }

    Tracks.prototype.model = Track;

    return Tracks;

  })(Backbone.Collection);

  MessagesView = (function(_super) {

    __extends(MessagesView, _super);

    function MessagesView() {
      MessagesView.__super__.constructor.apply(this, arguments);
    }

    return MessagesView;

  })(Backbone.View);

  TracksView = (function(_super) {

    __extends(TracksView, _super);

    function TracksView() {
      TracksView.__super__.constructor.apply(this, arguments);
    }

    return TracksView;

  })(Backbone.View);

  TodoApp = (function(_super) {

    __extends(TodoApp, _super);

    function TodoApp() {
      TodoApp.__super__.constructor.apply(this, arguments);
    }

    TodoApp.prototype.routes = {
      "": "index",
      "chat": "chat"
    };

    TodoApp.prototype.initialize = function() {
      this.users = new Users();
      this.messages = new Messages();
      return this.tracks = new Tracks();
    };

    TodoApp.prototype.index = function() {
      return console.log("Index Action");
    };

    TodoApp.prototype.start = function() {
      return Backbone.history.start();
    };

    TodoApp.prototype.chat = function() {
      return console.log("Chat Action");
    };

    return TodoApp;

  })(Backbone.Router);

  window.todoApp = new TodoApp();

}).call(this);
