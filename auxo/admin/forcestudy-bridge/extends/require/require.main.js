;(function (require) {

    //
    var dataAppSrc = $("script[data-app]").attr("data-app");
    var staticStore = (function () {
        var currentScript = document.scripts[document.scripts.length - 1];
        var scriptSrc = currentScript.getAttribute("src");
        var minify = /\?f=/i.test(currentScript);
        var urlMatches =scriptSrc.match(/https?:\/\/.+?\//i);
        var versionMatches = scriptSrc.match(/v=([^&]*)/i);
        return {
            url: (urlMatches ? urlMatches[0] : url.split("/").slice(0, 3).join("/") + "/") + (minify ? "?f=" : ""),
            version: versionMatches ? versionMatches[1] : (new Date()).getTime()
        }
    }());

    require.config(window.requireConfig(staticStore.url, staticStore.version) || {});
    require.config({
        paths: {
            app: dataAppSrc
        }
    });

    require(["app"], function (app){
        app.initViewModel();
    });

} (require));