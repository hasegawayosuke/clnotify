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
        url : "https://api.cybozulive.com",
        save : function(){
            return new Promise( function( resolve, reject ){
                chrome.storage.sync.set( { "config" : this.config }, function(){
                    try{
                        resolve();
                    }catch( e ){
                        reject( e );
                    }
                });
            } );
        },
        load : function(){
            return new Promise( function( resolve, reject ){
                chrome.storage.sync.get( "config", function ( items ){
                    try{
                        for( var key in obj.config ){
                            if( items.config[ key ] ) obj.config[ key ] = items.config[ key ];
                        }
                        resolve();
                    }catch( e ){
                        reject( e );
                    }
                } );
            } );
        },
        XHR : function( method, url, content, beforeSend ){
            var _this = this;
            return new Promise( function( resolve, reject ){
                var accessor = {
                    consumerSecret: _this.config.consumerSecret,
                    tokenSecret: _this.config.tokenSecret
                };

                var message = {
                    method: method,
                    action: url,
                    parameters: {
                        oauth_signature_method: "HMAC-SHA1",
                        oauth_consumer_key : _this.config.consumerKey,
                        oauth_token : _this.config.token
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
                if( beforeSend !== undefined ) beforeSend( xhr );

                xhr.setRequestHeader('Authorization', OAuth.getAuthorizationHeader( "", message.parameters ) );
                xhr.onload = function(){
                    if( xhr.status == 200 ){
                        resolve( xhr );
                    }else{
                        console.error( xhr.status,  xhr.statusText );
                        reject( new Error( xhr.statusText ) );
                    }
                }
                xhr.onerror = function(){
                    console.error( xhr.statusText );
                    reject( new Error( xhr.statusText ) );
                }
                xhr.send( null );
            } );
        },
        tab : function( url, urlToGo ){
            chrome.windows.getAll( {"populate" : true }, function( windowList ){
                var i, j, tabUrl;
                var found = false;
                for( i = 0; i < windowList.length; i++ ){
                    for( j = 0; j < windowList[ i ].tabs.length; j++ ){
                        tabUrl = windowList[ i ].tabs[ j ].url;
                        if( typeof url.test == "function" && url.test( tabUrl ) ){
                            found = true;
                        }else if( typeof url == "string" && tabUrl == url ){
                            found = true;
                        }
                        if( found ){
                            chrome.tabs.update( windowList[ i ].tabs[ j ].id, { active:true } );
                            return;
                        }
                    }
                }
                if( !found ){
                    window.open( urlToGo || url );
                }
            } );
        },

    };

    return obj;
})();

