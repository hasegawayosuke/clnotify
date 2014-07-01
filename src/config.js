document.addEventListener( "DOMContentLoaded", function(){
    cl.load().then( function(){
        if( cl.config.email ) $( "mail" ).value = cl.config.email;
        if( cl.config.password ) $( "pass" ).value = cl.config.password;
        if( cl.config.consumerKey ) $( "ckey" ).value = cl.config.consumerKey;
        if( cl.config.consumerSecret ) $( "csecret" ).value = cl.config.consumerSecret;
        if( cl.config.token )  $( "atoken" ).value = cl.config.token;
        if( cl.config.tokenSecret )  $( "asecret" ).value = cl.config.tokenSecret;
    } );
    $( "tokenform" ).addEventListener( "submit", function( evt ){
        if( $( "mail" ).value ) cl.config.email = $( "mail" ).value;
        //if( $( "pass" ).value ) cl.config.password = $( "pass" ).value;
        if( $( "ckey" ).value ) cl.config.consumerKey = $( "ckey" ).value;
        if( $( "csecret" ).value ) cl.config.consumerSecret = $( "csecret" ).value;

        var accessor = {
            consumerSecret: cl.config.consumerSecret,
            tokenSecret: ""
        };

        var message = {
            method: "POST",
            action: "https://api.cybozulive.com/oauth/token",
            parameters: {
                oauth_consumer_key : cl.config.consumerKey,
                oauth_signature_method: "HMAC-SHA1",
                oauth_version : "1.0",
                x_auth_username : cl.config.email,
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
                    $( "atoken" ).value = cl.config.token = responseParams['oauth_token'];
                    $( "asecret" ).value = cl.config.tokenSecret = responseParams['oauth_token_secret'];
                    cl.save().then( function(){ alert( "保存しました。Chromeを再起動してください。" );} );
                }else{
                    alert( "failed to get access-token.\n" + xhr.status + "\n" + xhr.statusText );
                }
            }
        };

        xhr.send( "x_auth_username=" + ( cl.config.email ) + 
                "&x_auth_password=" + encodeURIComponent( $("pass").value ) +
                "&x_auth_mode=client_auth" );


        evt.preventDefault();
    }, false );
}, false );


