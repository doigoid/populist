echonest = new EchoNest("B2DH7MOZ0PWGKE2AM")

class Populist
    constructor: ->

        @username = prompt("Your name?", "Unnamed")

        @player = new Player($("#player"), [])
        @player.audio.bind('ended', @onPlayerEnd)

        @backend = new Firebase('http://gamma.firebase.com/populist/')
        @playlist = $ '.requests'
        @results = $ '.make-request-results'

        $("#request-input").keypress((e) =>
            if e.keyCode == 13
                @search e
        )

        # initilize our backends
        @backend.child('tracks').on('value', @onRequest)

    onPlayerEnd: (event) =>
        @player.playing = false
        nextTrack = @player.playlist[0]
        if nextTrack is undefined
            return
        if nextTrack == @player.nowPlaying
            @backend.child('tracks/' + nextTrack.id).remove()
            nextTrack = @player.playlist[0]

        @playSong(nextTrack)

    onRequest: (requestQueue) =>
        # this gets called for changes in the request queue
        # rebuild the entire request dom
        @playlist.html ""
        requests = requestQueue.val()

        playlist = []
        for id, track of requestQueue.val()
            if !@player.playing or @player.nowPlaying.id != id
                @renderRequestItem id, track
                playlist.push
                    id: id
                    title: track.title
                    artist: track.artist
                    url: track.url

        @player.playlist = playlist.reverse()
        if !@player.playing and playlist.length
            @playSong playlist[0]

    playSong: (track) =>
        @player.nowPlaying = track
        @player.loadSong(track)
        @player.play()

        @playlist.find("##{track.id}").fadeOut()

    onVote: (event) =>
        event.preventDefault()
        $(event.currentTarget).hide()
        id = $(event.currentTarget).closest('li').attr('id')
        track = @backend.child('tracks').child(id)
        track.child('voters').push(@username)
        track.child('votes').transaction(
            (votes) -> votes + 1
            (success, snapshot) -> track.setPriority parseInt(snapshot.val(), 10)
        )

    search: (event) =>
        @results.html "<p align='center'>Searching...</p>"
        query = $('#request-input').val()

        echonest.artist(query).audio (tracks) =>
                @results.html ""
                @renderSearchResult t for t in tracks.data.audio

    addRequest: (id, url, artist, title, length) =>
        ref = @backend.child('tracks').push()
        ref.setWithPriority({
            id: id,
            url: url,
            artist: artist,
            title: title,
            duration: length,
            votes: 1
        }, -1)
        @results.html ""

    renderSearchResult: (track) =>
        searchResult = $("""
        <div id='#{ track.id }'>
            <a href='#{ track.url }'>
                <img src='img/icon-add.png' />
                <strong>#{ track.artist }</strong> &mdash; #{ track.title }
            </a>
        </div>""")

        searchResult.find('a').click (event) =>
            event.preventDefault()
            @addRequest track.id, track.url, track.artist, track.title, track.length

        @results.append searchResult


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
                <span class='artist'>#{ track.artist }</span> -
		<span class='track'>#{ track.title }</span>
            </h4>
            <div class='duration'>#{ duration }</div>
        </li>""")

        voters = for id,user of track.voters
            user

        if voters.indexOf(@username) != -1
            requestItem.find('.controls').css('visibility', 'hidden')

        requestItem.find('.vote-up').click(@onVote)
        @playlist.prepend requestItem

populist = null
$ ->
    window.populist = new Populist

