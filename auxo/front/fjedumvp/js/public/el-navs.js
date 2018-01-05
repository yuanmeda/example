(function () {
    window.onload = function () {
        var script = document.createElement('script');
        script.src = __static_url + '/auxo/front/fjedumvp/js/public/el-common.js?v=' + (typeof version == 'undefined' ? Math.random() : version);
        document.body.appendChild(script);
    }
})();