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
    $( "tab1" ).addEventListener( "click", function ( evt ){
        $( "tabpage1" ).style.display = "block";
        $( "tabpage2" ).style.display = "none";
        $( "tab1" ).classList.add( "tabselect" );
        $( "tab2" ).classList.remove( "tabselect" );
        evt.preventDefault();
    }, false );
    $( "tab2" ).addEventListener( "click", function ( evt ){
        $( "tabpage1" ).style.display = "none";
        $( "tabpage2" ).style.display = "block";
        $( "tab1" ).classList.remove( "tabselect" );
        $( "tab2" ).classList.add( "tabselect" );
        evt.preventDefault();
    }, false );
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
    } );
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
    $( "tab1" ).click();
}, false );


