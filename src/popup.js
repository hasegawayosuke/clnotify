function $( id ){ return document.getElementById(id);}

document.addEventListener( "DOMContentLoaded", function(){
    $("top").addEventListener( "click", function(){
        cl.tab( "https://cybozulive.com/" );
    }, false );
    $( "config" ).addEventListener( "click", function(){
        cl.tab( chrome.extension.getURL( "/config.html" ) ); 
    }, false );

    /*
    $( "searchform" ).addEventListener( "submit", function( evt ){
        window.open( chrome.extension.getURL( "/search.html?q=" + encodeURIComponent( $("q").value ) ) );
        evt.preventDefault();
    }, false );
    */
    $( "mute" ).addEventListener( "click", function( evt ){
        var enabled = $("mute").checked;
        if( enabled ){
            $( "mutehour" ).removeAttribute( "disabled" );
            $( "mutehourlabel" ).removeAttribute( "disabled" );
        }else{
            $( "mutehour" ).setAttribute( "disabled", true );
            $( "mutehourlabel" ).setAttribute( "disabled", true );
        }
        //evt.preventDefault();
    }, false );

}, false );
