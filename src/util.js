function $( id ){
    return document.getElementById( id );
}

function $html( template, values ){
    var re = /\[%\s+([\w]+)\s+%\]/g;
    return template.replace( re, function( s, captured ){
        if( values[ captured ] !== undefined ){
            return (values[ captured ] + "").replace( /&/g, "&amp;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" ).replace( /"/g, "&quot;" ).replace( /'/g, "&#x27;" );
        }else{
            return s;
        }
    } );
}

var cl = (function (){
    var _callbacks = [];
    var _loaded = false;

    var obj = {
        config : {
            email : "",
            consumerKey : "",
            consumerSecret : "",
            token : "",
            tokenSecret : ""
        },
        save : function( callback ){
            chrome.storage.sync.set( { "config" : this.config }, callback );
        },
        load : function( callback ){
            if( typeof callback == "function" ){
                if( _loaded ) callback.call( this );
                else _callbacks.push( callback );
            }
        },

        XHR : function( method, url, content, callback ){
            var accessor = {
                consumerSecret: this.config.consumerSecret,
                tokenSecret: this.config.tokenSecret
            };

            var message = {
                method: method,
                action: url,
                parameters: {
                    oauth_signature_method: "HMAC-SHA1",
                    oauth_consumer_key : this.config.consumerKey,
                    oauth_token : this.config.token
                }
            };
            if( content !== undefined )
                for( var key in content ) message.parameters[ key ] = content[ key ];
            OAuth.setTimestampAndNonce( message );
            OAuth.SignatureMethod.sign( message, accessor );
            //var target = OAuth.addToURL( message.action, message.parameters );
            var target = OAuth.addToURL( message.action, content );
            var xhr = new XMLHttpRequest();
            xhr.open( method, target, true );

            xhr.setRequestHeader('Authorization', OAuth.getAuthorizationHeader( "", message.parameters ) );
            xhr.onreadystatechange = function(){
                if( xhr.readyState == 4 )
                    callback.call( xhr );
            }
            xhr.send( null );
        },
    };

    chrome.storage.sync.get( "config", function( items ){
        for( var key in obj.config ){
            if( items.config[ key ] ) obj.config[ key ] = items.config[ key ];
        }
        if( !_loaded ){
            while( _callbacks.length ){
                _callbacks.shift().call( obj );
            }
        }
        _loaded = true;
    } );
    return obj;
})();

