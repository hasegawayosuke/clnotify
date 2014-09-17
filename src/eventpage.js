_mute = { enabled : false, time : 0 };

function checkMute(){
	if( _mute.enabled ){
		var now, d;
		if( _mute.time == 0 ) return true;
		now = new Date();
		d = new Date( _mute.time );
		if( d > now ) return true;
		_mute.enabled = false;
	}
	return false;
}



var notify = (function(){
    var urls = {};
    var audio;


    chrome.notifications.onButtonClicked.addListener( function( id, index ){
        if( urls[ id ] !== undefined && urls[ id ][ index ] != undefined ){
            var url = urls[ id ][ index ];
            if( url.match( /^https?:\/\// ) ) {
                cl.tab( url );
            }
        }
    } );
    chrome.notifications.onClicked.addListener( function( id ){
        if( id.match( /^[\d]+:[\d]+$/ ) ){
            var url = "https://cybozulive.com/" + id.replace( /:/g, "_" ) + "/top/top";
            cl.tab( url );
        }
    } );

    audio = new Audio( "" );
    audio.loop = false;
    audio.preload = "auto";

    return function(){
        /**/
		if( checkMute() ) return;
        var url = cl.url + "/api/notification/V2";
        if( cl.config.token == "" || cl.config.tokenSecret == "" ){
            console.error( "no access token" );
            return;
        }
        cl.XHR( "GET", url, {"unconfirmed":"true", "max-results" : "100", "category" : "BOARD" } ).then( function( xhr ){
            var gid, entries, sound = true;
            try{
                //console.log( xhr.responseXML );
                urls = {};
                entries = (function getEntries( xml ){
                    var i, j, entries = xml.getElementsByTagName( "entry" ) || [];
                    var group, topic, summary, url, gid, uid;
                    var r = {};
                    for( i = 0; i < entries.length; i++ ){
                        group = entries[ i ].getElementsByTagName( "group" )[ 0 ].getAttribute( "valueString" );
                        gid = entries[ i ].getElementsByTagName( "group" )[ 0 ].getAttribute( "id" );
                        topic = entries[ i ].getElementsByTagName("title")[0].textContent;
                        summary = entries[ i ].getElementsByTagName("summary")[0].textContent;
                        url = entries[ i ].getElementsByTagName( "link" )[ 0 ].getAttribute( "href" );
                        uid = entries[ i ].getElementsByTagName( "author" )[0].getElementsByTagName( "uri" )[0].textContent;

                        if( r[ gid ] === undefined ){
                            r[ gid ] = { 
                                type : "basic",
                                isClickable : true,
                                iconUrl : chrome.extension.getURL( "/icon48.png" ), 
                                title : group,
                                message : "",
                                buttons : []
                            };
                        }
                        (function( opt, index ){
                            cl.iconCache.icon( "user", uid ).then( function( icon ){
                                opt.buttons[ index ].iconUrl = icon.url;
                            } );
                        })( r[ gid ], r[ gid ].buttons.push( { title: topic + " - \n" + summary, iconUrl: chrome.extension.getURL( "/icon16.png" ) } ) -1 );

                        if( urls[ gid ] === undefined ) urls[ gid ] = [];
                        urls[ gid ].push( url );
                    }
                    return r;
                })( xhr.responseXML );
                chrome.notifications.getAll( function( notifies ){
                    for( var id in notifies ){
                        chrome.notifications.clear( id, function(){} );
                    }
                } );
                for( gid in entries ){
                    cl.iconCache.icon( "group", gid ).then( function( icon ){
                        entries[ icon.id ].iconUrl = icon.url;
                        chrome.notifications.create( icon.id, entries[ icon.id ], function(id){} );
                        if( sound && cl.config.sound ){
                            if( cl.config.sound == 1 ){
                                audio.src = chrome.extension.getURL( "/decision3.mp3" );
                            }else if( cl.config.sound == 2 ){
                                audio.src = chrome.extension.getURL( "/hanada-voice.aac" );
                            }else if( cl.config.sound == 3 ){
                                audio.src = cl.config.soundUrl;
                            }
                            audio.load();
                            audio.play();
                            sound = false;
                        }
                    } );
                }
            }
            catch( e ){
                console.error( e );
            }
        } ).catch( function ( e ){ 
            console.error( e );
        } );
    };
})();


hookHeaderReceived = function(){
    // TODO: 直接開くのを設定により変えられるように。
    var extensions = [ "pdf", "png", "jpeg", "jpg", "bmp", "gif" ];
    var handler = function( details ){
        var r = [];
        details.responseHeaders.forEach( function( headerPair ){
            var m, ext;
            if( headerPair.name.toLowerCase() === "content-disposition" ){
                m = /filename=\"([^\"]+)\"/.exec( headerPair.value );
                if( m !== null ){
                    ext = /\.([^\.]+)$/.exec( m[ 1 ] );
                    if( ext !== null ){
                        if( extensions.indexOf( ext[ 1 ].toLowerCase() ) !== -1 ){
                            headerPair.value = headerPair.value.replace( /^attachment;/i, "inline;" );
                        }
                    }
                }
            }
            r.push( headerPair );
        } );
        return { "responseHeaders" : r };
    }
    chrome.webRequest.onHeadersReceived.addListener( 
        handler, 
        { "urls" : ["https://cybozulive.com/*/gwCabinet/downloadFileDirect*"] },
        [ "blocking", "responseHeaders" ] 
    );
};

cl.load().then( function(){
    hookHeaderReceived();
    notify();
    chrome.alarms.onAlarm.addListener( notify );
    chrome.alarms.create( "cylive_alarm", { "periodInMinutes" : 2 } );
} );

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	if( sender.id === location.host ){
		if( typeof( request ) === "string" && request === "?mute" ){
			sendResponse( { mute : _mute } );
		}else if( typeof( request ) === "object" && request.mute ){
			_mute = request.mute;
		}
	}
     sendResponse({farewell: "goodbye"});
} );
