(function () {
    var v = '201708211522';

    var scripts = [
        '/auxo/addins/jquery/v1.7.1/jquery.min.js',
        '/auxo/addins/jquery-extension-nova/v1.0.0/jquery-extension-nova.min.js',
        '/auxo/front/fjedumvp/js/public/fjedu-header.js'
    ];

    var url = '';

    for (var i = 0; i < scripts.length; i++) {
        url += scripts[i];
        if (i < scripts.length - 1)
            url += ',';
    }

    var script = document.createElement('script');
    script.src = _FJEDU_CONFIG.staticUrl + '/?f=' + url + '&v=' + v;
    document.body.appendChild(script);
})();