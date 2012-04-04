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
    try
      audio = new Audio()
      if audio.canPlayType("audio/mpeg") isnt "no" then callback true

      audio.oncanplaythrough = (event) ->
        callback true
        return

      audio.onerror = (event) ->
        callback false, @error
        return

      audio.src = url
      audio.load()
      return

    catch error
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
    emitter.emit "Player::getTracks", snapshot.val()


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
    emitter.on "Player::getTracks", @setRequest
    $requestInput.keypress @doSearch

  doSearch: (event) =>
    if event.keyCode is 13
      $results.html "<p style='text-align:center;'>Searching...</p>"
      query = $('#request-input').val()
      echonest.artist(query).audio (tracks) =>
        $results.html ""
        @setSearchResult track for track in tracks.data.audio
      false

  createRequest: (track) =>
     helpers.canPlayAudio track.url, (canPlay, error) =>
      if canPlay
        @player.tracks.push().setWithPriority(
          id: track.id
          url: track.url
          artist: track.artist
          title: track.title
          duration: track.length
          votes: 1
          voters: [@chat.user]
        , -1)
        $requestInput.val ""
        $results.html ""
      else
        alert "Sorry, this song won't play on our player."

  setRequest: (track) =>
    console.log track
    s = parseInt track.duration, 10
    m = Math.floor(s / 60)
    s = ("0" + (s % 60)).slice(-2)
    duration = "#{m}:#{s}"

    requestItem = $("""
    <li id='#{ track.id }' class='request clearfix'>
        <h4 class='title'>
            <span class='artist'>#{ track.artist }</span> -
            <span class='track'>#{ track.title }</span>
        </h4>
        <div class='info clearfix'>
          <div class='controls clearfix'>
            <a href='javascript:void 0;' class='vote-up'></a>
            <a href='javascript:void 0;' class='vote-down'></a>
            <div class='votes'>#{track.votes} Vote#{if track.votes > 1 then 's' else ''}</div>
          </div>
          <div class='duration'>#{ duration }</div>
        </div>
    </li>""")

    if track.voters.indexOf(@chat.user) != -1
      requestItem.find(".controls").find("a").remove()
    
    requestItem.find(".vote-down").click(@onVote)
    requestItem.find(".vote-up").click(@onVote)
    $tracks.append requestItem


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