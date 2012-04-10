echonest = new EchoNest "B2DH7MOZ0PWGKE2AM"

class Player extends Emitter
class Request extends Backbone.Model
class Track extends Backbone.Model
class Message extends Backbone.Model

class RequestList extends Backbone.Collection
    model: Request
class TrackList extends Backbone.Collection
    model: Track
class MessageList extends Backbone.Collection
    model: Message

class RequestView extends Backbone.View
    template: _.template( $("#request-template").html() )
    events:
        "keypress .request-input": "updateOnEnter"

    updateOnEnter: (event) =>
        console.log(this) if event.keyCode is 13

class TrackView extends Backbone.View
    template: _.template( $("#track-template").html() )
    events:
        "click .vote.up":   "voteUp"
        "click .vote.down": "voteDown"
    voteUp: (event) ->
        console.log(this)
    voteDown: (event) ->
        console.log(this)

class MessageView extends Backbone.View
    template: _.template( $("#message-template").html() )
    events:
        "keypress .message-input": "updateOnEnter"

    updateOnEnter: ->
        console.log(this)

class AppView extends Backbone.View

requestView = new RequestView()
trackView = new TrackView()
messageView = new MessageView()