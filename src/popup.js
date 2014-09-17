function $( id ){ return document.getElementById(id);}

function ddd( s ){
	chrome.runtime.sendMessage( "debug msg:" + s , function() { } );
}

document.addEventListener( "DOMContentLoaded", function(){
	var _muteTime, _muteEnabled;
	$( "muteoption" ).style.display = "none";
	$( "mutestate" ).style.display = "none";
	chrome.runtime.sendMessage( "?mute", function( item ){
		if( item.mute === undefined ) return;

		if( item.mute.enabled ){
			$( "mute" ).checked = true;
			$( "mutestate" ).style.display = "block";
			if( item.mute.time === 0 ){
				$( "mutelimit" ).textContent = "解除する";
			}else{
				var d = new Date( item.mute.time );
				$( "mutelimit" ).textContent = d.getHours() + ":" + d.getMinutes();
			}
			$( "muteoption" ).style.display = "none";
		}else{
			$( "mute" ).checked = false;
		}
	} );
    $("top").addEventListener( "click", function(){
        cl.tab( "https://cybozulive.com/" );
    }, false );
    $( "config" ).addEventListener( "click", function(){
        cl.tab( chrome.extension.getURL( "/config.html" ) ); 
    }, false );

	var sendMuteMessage = function(){
		var msg = { "mute" : { "enabled" : false, "time" : 0 } };
		var e = $( "mute" ).checked;
		var t = new Date();
		if( e ){
			msg.mute.enabled = e;
			if( $( "mute1h" ).checked ){
				t.setHours( t.getHours() + 1 );
				t.setSeconds( 0 );
				t.setMilliseconds( 0 );
				t = t.getTime();
			}else if( $( "mute8h" ).checked ){
				t.setHours( t.getHours() + 8 );
				t.setSeconds( 0 );
				t.setMilliseconds( 0 );
				t = t.getTime();
			}else if( $( "muteforever" ).checked ){
				t = 0;
			}
			msg.mute.time = t;
		}

		if( _muteTime === t && _muteEnabled === e ) return;
		chrome.runtime.sendMessage( msg, function(response) { console.log(response.farewell); });
		_muteEnabled = e;
		_muteTime = t;
	};

    /*
    $( "searchform" ).addEventListener( "submit", function( evt ){
        window.open( chrome.extension.getURL( "/search.html?q=" + encodeURIComponent( $("q").value ) ) );
        evt.preventDefault();
    }, false );
    */
    $( "mute" ).addEventListener( "click", function( evt ){
        var enabled = $("mute").checked;
        if( enabled ){
			$( "muteoption" ).style.display = "block";
			$( "mutestate" ).style.display = "none";
        }else{
			$( "muteoption" ).style.display = "none";
			$( "mutestate" ).style.display = "none";
        }
		sendMuteMessage();
        //evt.preventDefault();
    }, false );

	$( "mute1h" ).addEventListener( "click", function( evt ){
		sendMuteMessage();
	}, false );
	$( "mute8h" ).addEventListener( "click", function( evt ){
		sendMuteMessage();
	}, false );
	$( "muteforever" ).addEventListener( "click", function( evt ){
		sendMuteMessage();
	}, false );


}, false );
