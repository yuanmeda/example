var SWFProgress=null;
if(!SWFProgress){
    SWFProgress = function (settings) {
        this.initSWF(settings);
    };
}
SWFProgress.prototype.initSWF=function(setting){
    var params={
        WINDOW : "window",
        wmode : "transparent",
        OPAQUE : "opaque"
    };
    if(swfobject.embedSWF){
        swfobject.embedSWF(setting.flash_url,setting.htmlId,setting.width,setting.height,"9.0.0",null,setting.flashvars,params,null);
    }

}