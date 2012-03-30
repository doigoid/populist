_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

refs = {};
firebase_url = 'http://gamma.firebase.com/populist/tracks';
echonest = new EchoNest("B2DH7MOZ0PWGKE2AM");
firebase_tracks = new Firebase(firebase_url);
chatMessagesPath = new Firebase('http://gamma.firebase.com/populist/chat');

chatMessagesPath.on('child_added', function(childSnapshot) {
    // childSnapshot is the added object.  We'll extract the value and use it to append to
    // our messagesDiv.
    var message = childSnapshot.val();

	var html = "<li><div><h3><abbr class='timeago'/ title='"+message.timestamp+"' /></h3>";
	html += "<h2>" + message.name + "</h2><p>" + message.text + "</p></div></li>";
    $("#messages ul").prepend(html);
});

// When the user presses enter on the message input, add the chat message to our firebase data.
$("#chat-message").keypress(function (e) {
    if (e.keyCode == 13) {
        // Push a new object onto chatMessagesPath with the name/text that the user entered.
		var now = new Date();
		var d = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());  
        chatMessagesPath.push({
			name:name,
			text:$("#chat-message").val(),
			timestamp: d
        });
        $("#chat-message").val("");
    }
});

Populist = (function() {
	
	_results = {};
	_queue = [];

	function Populist() {
		this.initialize();
	}

	Populist.prototype.initialize = function() {

		firebase_tracks.on('value', this.tracksQueue);
	};
	
	Populist.prototype.tracksQueue = function(tracks) {
		_queue = tracks;
		
		var queueTemplate = _.template(
			"<li id='{{ id }}'><div class='vote'>" +
				"<a class='vote-up' href='#{{ id }}'></a></div>" + 
				"<div class='track'>" + 
				"<div class='right'><p>{{ duration }}</p></div>" +
				"<div class='left'><h2><a href='#'>{{ artist }}</a> - {{ title }}</h2>" +
				"<span class='colored'>{{ votes }} votes</span></div></div>" + 
				"<div class='clearfix'></div></li>");

		$("#playlist").html("");
		
		var track_eles = [];
		tracks.forEach(function(track) {
			var id = track.name();
			
			refs[id] = new Firebase(firebase_url + '/' + id);
			var track = track.val();
			var duration = parseInt(track.duration);
			track_eles.push(
				queueTemplate({
					id: id,
					url: track.url,
					artist: track.artist,
					title: track.title,
					duration: parseInt(duration / 60) + ':' + duration % 60,
					votes: track.votes
				})
			);
		});
		
		
		_.each(track_eles.reverse(), function(t) { 
			$("#playlist").append(t);
		});

		$("#playlist .vote-up").click(function(e) {
			e.preventDefault();
			$(this).hide();
			var id = $(this).closest('li').attr('id');
			var trackref = refs[id];
			trackref.child('votes').transaction(
				function(votes) { return votes + 1 },
				function(success, snapshot) {
					trackref.setPriority(parseInt(snapshot.val()));
				}
			);
			
		});
	};

	Populist.prototype.searchArtist = function(e) {

		var resultTemplate = _.template(
			"<li id='{{ id }}'>" + 
				"<a href='{{ url }}'>" + 
				"<img src='img/icon-add.png' />" + 
				"<div><strong>{{ artist }}</strong> &mdash; {{ title }}</div>" +
			"</a></li>");

		e.preventDefault();

		var $results = $("#music-search-results");

		$results.html(
			"<li><h2 align=center>Searching...</h2></li>"
		);
		
		var artistName = $("#query").val();
		
		echonest.artist(artistName).audio(function(tracks) {
			$results.html("");
			_.each(tracks.data.audio, function(track) {
				this._results[track.id] = track;
				$results.append(
					$(resultTemplate({
						id: track.id,
						url: track.url,
						artist: track.artist,
						title: track.title
					})).click(function(e) {
						e.preventDefault();
						var ref = firebase_tracks.push();
						ref.setWithPriority({
							id: track.id,
							url: track.url,
							artist: track.artist,
							title: track.title,
							duration: track.length,
							votes: 1
						}, -1);
						refs[track.id] = ref;
					})
				)
			});
		});
	};
	
	return Populist;

})();

$(function() {
	name = prompt("Your name?", "Guest");
	$("#username").html(name);
	var populist = new Populist;
	$("#music-search").submit(populist.searchArtist);
});
