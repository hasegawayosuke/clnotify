function handler(){
    var notify = function(){
        var url = "https://api.cybozulive.com/api/notification/V2";
        if( cl.config.token == "" || cl.config.tokenSecret == "" ){
            console.log( "no access token" );
            return;
        }
        cl.XHR( "GET", url, {"unconfirmed":"true"} , function(){
            try{
                var entries = this.responseXML.getElementsByTagName( "entry" ) || [];
                var i;
                var items = [], title, message, url;
                var opt = {
                    type : "basic",
                    iconUrl: chrome.extension.getURL( "/icon48.png" ),
                };
                for( i = 0; i < entries.length; i++ ){
                    title = entries[ i ].getElementsByTagName("title")[0].textContent + " - ";
                    title += entries[ i ].getElementsByTagName( "group" )[ 0 ].getAttribute( "valueString" );
                    message = entries[ i ].getElementsByTagName("summary")[0].textContent;
                    url = entries[ i ].getElementsByTagName( "link" )[ 0 ].getAttribute( "href" );
                    opt.title = title;
                    opt.message = message;
                    chrome.notifications.create( url, opt, function(id){} );
                }
            }
            catch( e ){
                console.error( e );
            }
        } );
    };
    if( !chrome.notifications.onClicked.hasListener() ){
        chrome.notifications.onClicked.addListener( function( id ){
            if( id.match( /^https?:\/\// ) ){
                chrome.tabs.create( { url : id } );
            }
        } );
    }
    notify();
    chrome.alarms.onAlarm.addListener( notify );
    chrome.alarms.create( "cylive_alarm", { "periodInMinutes" : 2 } );
}

chrome.runtime.onInstalled.addListener( function(){ cl.load( handler ); } );
chrome.runtime.onStartup.addListener( function(){ cl.load( handler ); } );
