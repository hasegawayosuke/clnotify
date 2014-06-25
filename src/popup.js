function $( id ){ return document.getElementById(id);}

document.addEventListener( "DOMContentLoaded", function(){
    $("top").addEventListener( "click", function(){
        chrome.windows.getAll( {"populate" : true }, function( windowList ){
            var i, j;
            var url;
            var found = false;
            for( i = 0; i < windowList.length; i++ ){
                for( j = 0; j < windowList[ i ].tabs.length; j++ ){
                    url = windowList[ i ].tabs[ j ].url;
                    if( url === "https://cybozulive.com/" || url === "https://cybozulive.com" ){
                        found = true;
                        chrome.tabs.update( windowList[ i ].tabs[ j ].id, { active:true } );
                        break;
                    }
                }
            }
            if( !found ){
                window.open( "https://cybozulive.com/" );
            }
        } );
    }, false );
    $( "config" ).addEventListener( "click", function(){
        window.open( chrome.extension.getURL( "/config.html" ) ); 
    }, false );

    /*
    $( "searchform" ).addEventListener( "submit", function( evt ){
        window.open( chrome.extension.getURL( "/search.html?q=" + encodeURIComponent( $("q").value ) ) );
        evt.preventDefault();
    }, false );
    */

}, false );
