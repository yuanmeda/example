(function ($, w) {
    'use strict';
    w['RESOURCE_CONFIG_MAP'] = (function () {
        var map = {}, g = window.allGroupNames;
        for (var i = 0; i < g.length; i++)
            map[g[i].type] = g[i];
        return map;
    }());

    function formatUrl(url, data) {
        url = url || '';
        url = url.replace(/\$\{project_code\}/gi, projectCode);
        data.resource_id = data.resource_id || data.unit_id;
        if (data) url = url.replace(/\$\{data\.(.+?)(\|(.+?))?\}/gi, function (match, m1, m2, filter) {
            var arr = m1.split('.'), d = data;
            for (var i = 0; i < arr.length; i++)
                d = d[arr[i]];
            if (filter) {
                switch (filter) {
                    case 'e':
                        d = encodeURIComponent(d);
                }
            }
            return d;
        });
        return url;
    }

    w.commonUtils = {
        'formatUrl': formatUrl
    }
})(jQuery, window);
