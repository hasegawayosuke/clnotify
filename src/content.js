(function(){
    window.addEventListener( "click", function( evt ){
        // 添付ファイルへのリンクには target=_blank を追加
        var elm = evt.toElement.parentNode;
        console.log( elm );
        if( elm && elm.tagName == "A" && Array.prototype.indexOf.call( elm.classList, "download" ) != -1 ){
            elm.setAttribute( "target", "_blank" );
        }
    }, true );
})();
    

