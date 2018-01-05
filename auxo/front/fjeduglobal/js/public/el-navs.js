(function () {
    window.onload = function () {
        var script = document.createElement('script');
        script.src = static_url + '/auxo/front/fjeduglobal/js/public/el-common.js?v=' + (typeof version == 'undefined' ? Math.random() : version);
        document.body.appendChild(script);
    }
})();