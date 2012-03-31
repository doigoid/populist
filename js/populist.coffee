class Populist
    constructor: ->

        @username = prompt("Your name?")

        @backends =
            requests: new Firebase('http://gamma.firebase.com/populist/tracks')
            chat:     new Firebase('http://gamma.firebase.com/populist/chat')

        @playlist = $ '.requests'
        @queue = {}
        # initilize our backends
        @backends.requests.on('value', @onRequest)
        #@backends.chat.on('value', @onChat)

    onRequest: (requestQueue) =>
        # this gets called for changes in the request queue
        # rebuild the entire request dom
        @playlist.html ""
        requests = requestQueue.val()
        for id, track of requestQueue.val()
            @renderRequestItem id, track

    onVote: (event) =>
        event.preventDefault()
        $(event.currentTarget).hide()
        id = $(event.currentTarget).closest('li').attr('id')
        track = @backends.requests.child(id)
        track.child('voters').push(@username)
        track.child('votes').transaction(
            (votes) -> votes + 1
            (success, snapshot) -> track.setPriority parseInt(snapshot.val(), 10)
        )

    renderRequestItem: (id, track) =>

        seconds = parseInt track.duration, 10
        duration = "#{ Math.floor(seconds / 60) }:#{ seconds % 60 }"

        requestItem = $("""
        <li id='#{ id }' class='request clearfix'>
            <div class='controls clearfix'>
                <a href='javascript:void 0;' class='vote-up'></a>
                <a href='javascript:void 0;' class='vote-down'></a>
                <div class='votes'>#{ track.votes }</div>
            </div>
            <h4 class='title'>
                <span class='artist'>#{ track.artist }</span> - <span class='track'>#{ track.title }</span>
            </h4>
            <div class='duration'>#{ duration }</div>
        </li>""")

        voters = for id,user of track.voters
            user

        if voters.indexOf(@username) != -1
            requestItem.find('.controls').css('visibility', 'hidden')

        requestItem.find('.vote-up').click(@onVote)
        @playlist.prepend requestItem

$ ->
    populist = new Populist

