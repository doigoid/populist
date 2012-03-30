

populist.ui.resize = function() {
    
    //$("#container").height(window.innerHeight);

    //$("#request-queue").css("min-height", window.innerHeight / 2 - 90 + "px" );
    //$("#add-music").css("min-height", window.innerHeight / 2 - 90 + "px" );

    lh = $("#left").innerHeight();
    rh = $("#right").innerHeight();

    if(lh > rh) {
	$("#right").css('min-height', lh - 35 + 'px');
    } else {
	$("#left").css('min-height', rh - 35 + 'px');
    }
    
};

populist.playlist.request = function(track_id) {
    
    var args = { 
	"track_id": track_id, 
	"_xsrf": getCookie("_xsrf"),
    };
    
    $.post(
	base_url + "playlist",
	$.param(args), 
	function(r) {
	    $("#playlist").html(r.html);
	    populist.playlist.queue = r.items;
	    if(!$("#populist-player").data("jPlayer")) {
		populist.player();
		$("#populist-player").jPlayer("play");
	    }
	    $("#playlist abbr.timeago").timeago();
	    populist.ui.resize();
	},
	'json'
    );
}

populist.playlist.vote = function(plitem_id, vote) {
    
    var args = { 
	"plitem_id": plitem_id, 
	"vote": vote || 1,
	"_xsrf": getCookie("_xsrf"),
    };
    
    $.post(
	base_url + "playlist",
	$.param(args), 
	function(r) {
	    $("#playlist").html(r.html);
	    $("#playlist abbr.timeago").timeago();
	    populist.ui.resize();
	}
    );
}

populist.playlist.played = function(plitem_id) {
    
    var args = { 
	"played_id": plitem_id,
	"_xsrf": getCookie("_xsrf"),
    };
    console.log(args);
    $.post(
	base_url + "playlist",
	$.param(args),
	function(r) {
	    $("#playlist").html(r.html);
	    populist.playlist.queue = r.items;
	    $("#playlist abbr.timeago").timeago();
	    populist.ui.resize();
	},
	"json"
    );
}

populist.playing = null;
populist.player = function() {
    $("#populist-player").jPlayer({
	
	ready: function () { 
	    onair = populist.playlist.queue.shift();
	    $(this).jPlayer("setMedia", {
		mp3: onair.url,
	    })
	    $("#now-playing").html( onair.artist + "&mdash;" + onair.title);
	    populist.playing = onair.id + "";
	},
	
	play: function(event) {
	    $(".jp-play").hide();
	    $(".jp-volume-bar").show();
	},
	
	ended: function (event) {
	    
	    onair = populist.playlist.queue.shift();
	    
	    $(this).jPlayer("setMedia", {
		mp3: onair.url,
	    }).jPlayer("play");
	    
	    $("#now-playing").html( onair.artist + "&mdash;" + onair.title);
	    $("#request-queue ul li:first-child").slideUp();
	    populist.playlist.played(populist.playing);
	    populist.playing = onair.id + "";
	    
	},

	swfPath: "/static",
	supplied: "mp3",
	
    });
    
    $("div.jp-seek-bar").unbind('click');
    $("div.jp-play-bar").unbind('click');
}

$(window).resize(populist.ui.resize);
$(document).ready(function() {
    
    //populist.playlist.live();
    
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    // initialize column heights
    populist.ui.resize();
    
    $("abbr.timeago").timeago();

    $("#chat-message").keydown(function(e) {
	if(e.keyCode == 13) {
	    e.preventDefault(); // Makes no difference
	    newMessage();
	}
    });

    $("#chat-message-submit").click(function(e) {
	e.preventDefault();
	newMessage();
    });

    $.get(base_url + "listeners",
	  function(r) { 
	      $("#listeners").html(r);
	  });
    
					  /*
    $("#music-search").submit(function(e) {
	e.preventDefault();
	$("#music-search-results").html("<li><h2 align=center>Searching...</h2></li>");
	$.post(
	    "/catalog/echonest",
	    $(this).serialize(), 
	    function(r) {
		$("#music-search-results").html(r);
		populist.ui.resize();
	    }
	);
    });
	*/
    $("#fullscreen").click(function() {
	if($("#content").is(":visible")) {
	    $('body').toggleClass('fullscreen');
	    $("#station-logo").fadeOut();
	    $("#content").slideUp();
	    
	}
	else {
	    $('body').removeClass('fullscreen');
	    $("#station-logo").fadeIn();
	    $("#content").slideDown();
	}
    });
    
    if(populist.playlist.queue.length) {
	populist.player();
    }
    
    setTimeout(chat_updater.poll, 1000);
    setTimeout(playlist_updater.poll, 1000);
    return;
});

function newMessage() {
    var message = $("#chat form").serialize(); 
    $("#chat-message").val("");
    
    $.post(base_url + "activity", message, function(response) {
        chat_updater.showMessage(response);
    });
}

var playlist_updater = {
    
    errorSleepTime: 500,
    cursor: null,

    poll: function() {
        var args = {"_xsrf": getCookie("_xsrf")};
        $.ajax({url: base_url + "playlist", 
		type: "GET", 
                data: $.param(args), 
		dataType: "json",
		success: playlist_updater.onSuccess,
                error: playlist_updater.onError});
    },

    onSuccess: function(response) {
        try {
	    playlist_updater.newPlaylist(response);
        } catch (e) {
            playist_updater.onError();
            return;
        }
        playlist_updater.errorSleepTime = 500;
        window.setTimeout(playlist_updater.poll, 0);
    },

    onError: function(response) {
        playlist_updater.errorSleepTime *= 2;
        window.setTimeout(playlist_updater.poll, playlist_updater.errorSleepTime);
    },

    newPlaylist: function(response) {
        if (!response.html) 
	    return;
        
	populist.playlist.queue = response.live;

	var playlist = response.html;
	$("#playlist").html(playlist);
	
	populist.ui.resize();
	$("#playlist abbr.timeago").timeago();	
    },
};

var chat_updater = {
    
    errorSleepTime: 500,
    cursor: null,

    poll: function() {
        var args = {"_xsrf": getCookie("_xsrf")};
        if (chat_updater.cursor) 
	    args.cursor = chat_updater.cursor;
        $.ajax({url: base_url + "activity", 
		type: "GET", 
		dataType: "json",
                data: $.param(args), 
		success: chat_updater.onSuccess,
                error: chat_updater.onError});
    },

    onSuccess: function(response) {
        try {
            chat_updater.newMessages(response);
        } catch (e) {
            chat_updater.onError();
            return;
        }
        chat_updater.errorSleepTime = 500;
        window.setTimeout(chat_updater.poll, 0);
    },

    onError: function(response) {
        chat_updater.errorSleepTime *= 2;
        window.setTimeout(chat_updater.poll, chat_updater.errorSleepTime);
    },

    newMessages: function(response) {
        if (!response.messages) return;
        chat_updater.cursor = response.cursor;
        var messages = response.messages;
        chat_updater.cursor = messages[messages.length - 1].id;
        for (var i = 0; i < messages.length; i++) {
            chat_updater.showMessage(messages[i]);
        }
    },

    showMessage: function(message) {
	
        var existing = $("#m" + message.id);
        if (existing.length > 0) return;
        var node = $(message.html);
        //node.hide();
        //node.slideDown();
        $("#messages ul").prepend(node);
	if($("#messages ul li").length > 10) {
	    $("#messages ul li").each(function(index) {
                if ( (index+1) > 10 ) {
                    $(this).remove();
                }
            });
	}
	populist.ui.resize();
	$("abbr.timeago").timeago();
    }
};
