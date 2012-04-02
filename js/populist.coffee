class Populist
    constructor: ->

        @username = prompt("Your name?")

        @player = new Player($("#player"), [])
        @player.audio.bind('ended', @onPlayerEnd)

        @backend = new Firebase('http://gamma.firebase.com/populist/tracks')
        @playlist = $ '.requests'
        @results = $ '.make-request-results'

        # initilize our backends
        @backend.child('tracks').on('value', @onRequest)

    onPlayerEnd: (event) =>
        console.log("ended")
        nextTrack = @player.playlist[0]
        if nextTrack == @player.nowPlaying
            @backends.requests.child(nextTrack.id).remove()
            nextTrack = @player.playlist[0]
        @player.nowPlaying = nextTrack
        @player.loadSong(nextTrack)
        @player.play()

    onRequest: (requestQueue) =>
        # this gets called for changes in the request queue
        # rebuild the entire request dom
        @playlist.html ""
        requests = requestQueue.val()

        playlist = []
        for id, track of requestQueue.val()
            @renderRequestItem id, track
            playlist.push
                id: id
                title: track.title
                artist: track.artist
                url: track.url

        @player.playlist = playlist.reverse()
        if !@player.playing
            @player.nowPlaying = playlist[0]
            @player.loadSong(playlist[0])
            @player.play()

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
        event.preventDefault()
        @results.html "<p align='center'>Searching...</p>"
        query = $('#request-input').val()

        echonest.artist(query).audio (tracks) ->
                @results.html ""
                @renderSearchResult t for t in tracks.data.audio

    renderSearchResult: (track) =>
        searchResult = $("""
	<div id='#{ track.id }'>
	  <a href='#{ track.url }'>
	    <img src='img/icon-add.png' />
	    <strong>#{ track.artist }</strong> &mdash; #{ track.title }
	  </a>
        </div>""")

        searchResult.find('a').click(@request)

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

