
function updateGroup( ){
	var getGroups = function(){
		return new Promise( function( resolve, reject ){
			var groups = {};
			// { "group-id" : "gropu-name", "folder-id" : { "name" : "folder-name", ... } }
			var url = cl.url + "/api/group/V2";
			var opt = { "max-results" : 100 };
			cl.XHR( "GET", url, opt ).then( function( xhr ){
				var xml = xhr.responseXML;
				if( !xml ) {
					reject( new Error( xhr.status ) );
					return;
				};
				console.log( xml );
				var entries = xml.querySelectorAll( "entry" );
				for( var i = 0; i < entries.length; i++ ){
					var title = entries[ i ].querySelector( "title" ).textContent;
					var id = ( entries[ i ].querySelector( "id" ).textContent || "" ).replace( /GROUP,/,"" );
					var folder = entries[ i ].querySelector( "*|folder" );
					if( folder && folder.nodeName =="cblGrp:folder" ){
						if( groups[ folder.id ] === undefined ){
							groups[ folder.id ] = { "name" : folder.getAttribute( "valueString" ) };
						}
						groups[ folder.id ][ id ] = title;
					}else{
						groups[ id ] = title;	
					}
				}
				resolve( groups );
			} );
		} );
	};
	//<img width="20" height="20" id="icon<%=id%>" alt="<%=groupname%>">
	getGroups().then( function( groups ){
		console.log( groups );
		var id, name, s = "", id2;
		var t1 = $("template1").innerHTML;
		var t2 = $("template2").innerHTML;
		var t3 = $("template3").innerHTML;
		var elm = $( "grouplist" ), child;
		while( child = elm.lastChild ) elm.removeChild( child );
		for( id in groups ){
			if( typeof groups[id] == "object" ){
				for( id2 in groups[ id ] ){
					name = groups[ id ][ id2 ];
					if( id2 === "name" ){
						s += cl.html( t3, { folder:name } );
					}else{
						s += cl.html( t2, { id:id2, groupname:name } );
						cl.iconCache.icon( "group", id2 ).then( function( icon ){ /* cache */ } );
					}
				}
			}else{
				name = groups[ id ];
				s += cl.html( t1, { id:id, groupname:name } );
				cl.iconCache.icon( "group", id ).then( function( icon ){ /* cache */ } );
			}
		}
		elm.innerHTML = s;
		for( id in groups ){
			if( typeof groups[id] == "object" ){
				for( id2 in groups[ id ] ){
					if( id2 === "name" ) continue;
					cl.iconCache.icon( "group", id2 ).then( function( icon ){ 
						$( "icon" + icon.id ).src = icon.url;
					} );
				}
			}else{
				cl.iconCache.icon( "group", id ).then( function( icon ){ 
					$( "icon" + icon.id ).src = icon.url;
				} );
			}
		}
		
	} );
}

document.addEventListener( "DOMContentLoaded", function(){
    var soundData = "", soundName = "";
    $( "save" ).addEventListener( "click", function ( evt ){
        if( $( "mail" ).value ) cl.config.email = $( "mail" ).value;
        //if( $( "pass" ).value ) cl.config.password = $( "pass" ).value;
        if( $( "ckey" ).value ) cl.config.consumerKey = $( "ckey" ).value;
        if( $( "csecret" ).value ) cl.config.consumerSecret = $( "csecret" ).value;
        if( $( "atoken" ).value ) cl.config.token = $( "atoken" ).value;
        if( $( "asecret" ).value ) cl.config.tokenSecret = $( "asecret" ).value;

        cl.config.sound = 0;
        for( var i = 0; i <= 3; i++ ){
            if( $( "soundtype" + i ).checked ){
                cl.config.sound = i;
                break;
            }
        }
        cl.config.soundUrl = $( "soundurl" ).value;
        cl.save().then( function(){ alert( "保存しました。Chromeを再起動してください。" );} );
        evt.preventDefault();
    }, false );
	(function(){
		var i;
		var tabs = document.getElementsByClassName( "tab" );
		for( i = 0; i < tabs.length; i++ ){
			tabs[ i ].addEventListener( "click", function( evt ){
				var tabs = document.getElementsByClassName( "tab" );
				var tabpages = document.getElementsByClassName( "tabpage" );
				for( i = 0; i < tabs.length; i++ ){
					if( tabs[ i ] === this ){
						tabs[ i ].classList.add( "tabselect" );
					}else{
						tabs[ i ].classList.remove( "tabselect" );
					}
					if( tabpages[ i ] ){
						tabpages[ i ].style.display = tabs[ i ] === this ? "block" : "none";
					}
				}
				evt.preventDefault();
			}, false );
		}
	})();

    cl.load().then( function(){
        $( "soundtype0" ).checked = true;
        if( cl.config.email ) $( "mail" ).value = cl.config.email;
        if( cl.config.password ) $( "pass" ).value = cl.config.password;
        if( cl.config.consumerKey ) $( "ckey" ).value = cl.config.consumerKey;
        if( cl.config.consumerSecret ) $( "csecret" ).value = cl.config.consumerSecret;
        if( cl.config.token )  $( "atoken" ).value = cl.config.token;
        if( cl.config.tokenSecret )  $( "asecret" ).value = cl.config.tokenSecret;
        if( 0 <= cl.config.sound && cl.config.sound <= 3 ) $( "soundtype" + cl.config.sound ).checked = true;
        if( cl.config.soundUrl ) $( "soundurl" ).value = cl.config.soundUrl;
		updateGroup();
    } );
	$( "updategroup" ).addEventListener( "click", function( evt ){
		updateGroup();
		evt.preventDefault();
	}, false );
	$( "checkall" ).addEventListener( "click", function( evt ){
		var elms = document.querySelectorAll( "input.group" );
		for( var i = 0; i < elms.length; i++ ){
			elms[ i ].checked = true;
		}
		evt.preventDefault();
	}, false );
	$( "uncheckall" ).addEventListener( "click", function( evt ){
		var elms = document.querySelectorAll( "input.group" );
		for( var i = 0; i < elms.length; i++ ){
			elms[ i ].checked = false;
		}
		evt.preventDefault();
	}, false );
    $( "tokenform" ).addEventListener( "submit", function( evt ){
        var accessor = {
            consumerSecret: $( "csecret" ).value,
            tokenSecret: ""
        };

        var message = {
            method: "POST",
            action: "https://api.cybozulive.com/oauth/token",
            parameters: {
                oauth_consumer_key : $( "ckey" ).value,
                oauth_signature_method: "HMAC-SHA1",
                oauth_version : "1.0",
                x_auth_username : $( "mail" ).value,
                x_auth_password : $( "pass" ).value,
                x_auth_mode : "client_auth"
            }
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var xhr = new XMLHttpRequest();

        xhr.open( "POST", "https://api.cybozulive.com/oauth/token", true );

        xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
        xhr.setRequestHeader('Authorization',
                             'OAuth oauth_nonce="' + message.parameters.oauth_nonce + '"'
                             + ', oauth_signature_method="HMAC-SHA1"'
                             + ', oauth_timestamp="' + message.parameters.oauth_timestamp + '"'
                             + ', oauth_consumer_key="' + message.parameters.oauth_consumer_key + '"'
                             + ', oauth_signature="' + encodeURIComponent(message.parameters.oauth_signature) + '"'
                             + ', oauth_version="1.0"');

        xhr.onreadystatechange = function() {
            if( xhr.readyState == 4 ){
                if( xhr.status == 200 ){
                    var responseParams = OAuth.getParameterMap(xhr.responseText);
                    $( "atoken" ).value = responseParams['oauth_token'];
                    $( "asecret" ).value = responseParams['oauth_token_secret'];
                }else{
                    alert( "failed to get access-token.\n" + xhr.status + "\n" + xhr.statusText );
                }
            }
        };

        xhr.send( "x_auth_username=" + ( $( "mail" ).value ) + 
                "&x_auth_password=" + encodeURIComponent( $("pass").value ) +
                "&x_auth_mode=client_auth" );

        evt.preventDefault();
    }, false );
	document.getElementsByClassName( "tab" )[ 0 ].click();
}, false );


