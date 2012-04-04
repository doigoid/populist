$body = $(document.body);
echonest = new EchoNest "B2DH7MOZ0PWGKE2AM"
emitter = new Emitter()
firebase = new Firebase "http://gamma.firebase.com/populist/"

helpers = 

  sanitizeInput: (string) ->
    string.replace /(<([^>]+)>)/ig, ""

  formatTime: (date) ->
    d = if typeof date is "string" or typeof date is "number" then new Date(date) else date
    ap = if (h = d.getHours()) < 12 then "AM" else "PM"
    h = if h > 12 then h - 12 else h
    h = if h is 0 then 12 else h
    m = if (m = d.getMinutes()) > 10 then m else "0#{m}"
    return "#{h}:#{m} #{ap}"
  canPlayAudio: (url, callback) ->
    # this function is async
    audio = new Audio()
    try

      if audio.canPlayType("audio/mpeg") isnt "no"
        console.log "it isn't no"
        callback true

      audio.oncanplaythrough = (event) ->
        callback true
        return
      audio.onerror = (event) ->
        console.log "onerror"
        callback false, @error
        return

      audio.src = url
      audio.load()
      console.log audio
      return
    catch error
      console.log "catch"
      callback false, error
      return


class Player
  $audio = $ "<audio />"

  constructor: ->
    # Variables
    @currentTrack = firebase.child "current_track"
    @tracks = firebase.child "tracks"

    # Events
    @tracks.on "child_added", @getTracks

  play: ->
    $audio[0].play()
    emitter.emit "Player::play"

  pause: ->
    $audio[0].pause()
    emitter.emit "Player::pause"

  getTracks: (snapshot) ->
    console.log snapshot.val()
    emitter.emit "Player::getTracks"


class Chat
  $chatInput = $ "#chat-input"
  $messages = $ ".messages"

  constructor: ->
    # Variables
    @user = null
    @presence = null
    @messages = firebase.child("messages")
    @setUsername("What is your name?")
    # Events
    @messages.limit(100).on "child_added", @getMessages

    $chatInput.keypress @sendMessage

  setUsername: (message) ->
    @user = prompt message, ""
    @presence = firebase.child "users/#{@user}/online"
    @presence.once "value", (snapshot) =>
      unless snapshot.val()
        @presence.setOnDisconnect(false)
        @presence.set(true)
        emitter.emit "Chat::setUsername", @user
      else
        @setUsername "Please pick another username"
        return

  setMessage: (user, text, timestamp) ->
    $messages.prepend """<li class="message clearfix">
              <div class="timestamp">#{timestamp}</div>
              <span class="user">#{user}</span>
              <span class="text">#{text}</span>
            </li>"""
    return

  sendMessage: (event) =>
    if event.keyCode is 13
      message = helpers.sanitizeInput $chatInput.val()
      @messages.push
        user: @user
        text: message
        timestamp: +new Date()

      $chatInput.val ""
      emitter.emit "Chat::sendMessage"

      false

  getMessages: (snapshot) =>
    message = snapshot.val()
    @setMessage message.user, message.text, helpers.formatTime message.timestamp
    emitter.emit "Chat::getMessages"
    return


  toggleChat: ->
    if $body.hasClass "chat-open" then $body.removeClass "chat-open" else $body.addClass "chat-open"
    return


class Populist
  $chatBtn = $ "#chat-button"
  $username = $ "#username"
  $tracks = $ ".requests"
  $results = $ ".make-request-results"
  $requestInput = $ "#request-input"

  constructor: ->
    # Variables
    @chat = new Chat()
    @player = new Player()

    # Events
    $username.click => @chat.setUsername "What is your name?"; return
    $chatBtn.click => @chat.toggleChat(); return
    emitter.on "Chat::setUsername", (username) -> $username.html(helpers.sanitizeInput username); return
    emitter.on "Player::getTracks", @updateRequestQueue
    $requestInput.keypress @doSearch

  updateRequestQueue: (tracks) ->

  setRequest: ->
  doSearch: (event) =>
    if event.keyCode is 13
      $results.html "<p align='center'>Searching...</p>"
      query = $('#request-input').val()
      echonest.artist(query).audio (tracks) =>
        $results.html ""
        @setSearchResult track for track in tracks.data.audio
      false

  createRequest: (track) =>
     helpers.canPlayAudio track.url, (canPlay, error) ->
      console.log canPlay, error
      if canPlay
        @player.tracks.push().setWithPriority({
          id: track.id,
          url: track.url,
          artist: track.artist,
          title: track.title,
          duration: track.length,
          votes: 1
        }, -1)
        $requestInput.val ''
      else
        #alert "Sorry, this song won't play on our player."

    $results.html ""

  setSearchResult: (track) =>
        searchResult = $("""
        <div id='#{ track.id }'>
            <a href='#{ track.url }'>
                <img src='img/icon-add.png' />
                <strong>#{ track.artist }</strong> &mdash; #{ track.title }
            </a>
        </div>""")

        searchResult.find('a').click (event) =>
            event.preventDefault()
            @createRequest track

        $results.prepend searchResult

populist = new Populist()