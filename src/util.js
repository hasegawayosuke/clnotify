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
		html: function( template, param ){
			htmlEscape = function( s ){
				return s.replace( /&/g, "&amp;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" ).replace( /"/g, "&quot;" ).replace( /'/g, "&#x27" );
			};
			if( param === undefined ) param = {};
			if( template instanceof HTMLElement ){
				template = template.outerHTML;
			}
			return template.replace( /<%([\=\-]?)\s*(.+?)(?:\s*%>)/g, function( str, p1, p2 ){
				if( p1 == "=" ){
					return this.htmlEscape( param[ p2 ] !== undefined ? param[ p2 ] : "" );
				}else if( p1 == "-" ){
					return param[ p2 ] !== undefined ? param[ p2 ] : "";
				}else{
					return p2 !== undefined ? eval( "(" + p2 + ")" ) : "";
				}
			} );
		},
        config : {
            email : "",
            consumerKey : "",
            consumerSecret : "",
            token : "",
            tokenSecret : "",
            sound : 0,
        },
        url : "https://api.cybozulive.com",
        save : function(){
            var _this = this;
            return new Promise( function( resolve, reject ){
                chrome.storage.sync.set( { "config" : _this.config }, function(){
                    try{
                        resolve();
                    }catch( e ){
                        reject( e );
                    }
                });
            } );
        },
        load : function(){
            var _this = this;
            return new Promise( function( resolve, reject ){
                chrome.storage.sync.get( "config", function ( items ){
                    var copy = function( dst, src ){
                        for( var key in src ){
                            if( typeof( src[ key ] ) == "object" ){
                                dst[ key ] = {};
                                copy( dst[ key ], src[ key ] );
                            }else{
                                dst[ key ] = src[ key ];
                            }
                        }
                    };
                    try{
                        copy( _this.config, items.config );
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
		iconCache : (function(){
			var o = {};
			var _icons = {};
			o.icon = function( type, id, forceUpdate ){
				return new Promise( function( resolve, reject ){
					var url = cl.url + "/api/icon/V2";
					if( forceUpdate && _icons[ type + ":" + id ] ){
						window.URL.revokeObjectURL( _icons[ type + ":" + id ] );
						delete _icons[ type + ":" + id ];
					}
					if(  _icons[ type + ":" + id ] !== undefined ){
						resolve( { id : id, url : _icons[ type + ":" + id ] } );
					}else{
						var opt = { type : type };
						opt[ type ] = id;
						cl.XHR( "GET", url, opt, function( xhr ){
							xhr.responseType = "blob";
						} ).then( function( xhr ){
							if( xhr.response ){
								var url = window.URL.createObjectURL( xhr.response );
								_icons[ type + ":" + id ] = url;
								resolve( { id : id, url : url } );
							}else{
								reject( new Error( "no group found" ) );
							}
						} );
					}
				} );
			};
			return o;
		})(),
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

