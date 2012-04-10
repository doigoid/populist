firebase = new Firebase('http://gamma.firebase.com/populist/');

class User extends Backbone.Model
class Message extends Backbone.Model
class Track extends Backbone.Model

class Users extends Backbone.Collection
  model: User
class Messages extends Backbone.Collection
  model: Message
class Tracks extends Backbone.Collection
  model: Track

class MessagesView extends Backbone.View
class TracksView extends Backbone.View

class TodoApp extends Backbone.Router
  routes:
    "": "index"
    "chat": "chat"
  initialize: ->
    @users = new Users()
    @messages = new Messages()
    @tracks = new Tracks()
  index: ->
    console.log "Index Action"
  start: ->
    Backbone.history.start()
  chat: ->
    console.log "Chat Action"

window.todoApp = new TodoApp();