(function () {
    window.onload = function () {
        var script = document.createElement('script');
        script.src = elStaticUrl + '/auxo/front/global_fjedu/js/el-common.js?v=' + (typeof version == 'undefined' ? Math.random() : version);
        // script.src = 'http://static.auxo.local.huayu.nd' + '/auxo/front/global_fjedu/js/el-common.js?v=201703227999';
        document.body.appendChild(script);
    }
})();