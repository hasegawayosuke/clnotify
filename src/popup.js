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

}, false );
