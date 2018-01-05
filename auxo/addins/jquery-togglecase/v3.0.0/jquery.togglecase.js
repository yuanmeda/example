/**
 * æ‰©å±•jQueryçš„ajaxæ–¹æ³•ï¼Œå°†Dataå‚æ•°ä¸­çš„å‘½åæ–¹å¼è½¬æ¢æˆå¯¹åº”çš„ä¹¦å†™æ ¼å¼
 * Created by LinTao on 2016/1/12.
 */
(function () {
    window.toggleCase = function (data, type) {
        return toggleCase(data, type);
    };

    var toSnakeCase = function (value) {
        value = value.replace(/([A-Z])/g, "_$1").toLowerCase();
        if (value.indexOf('-') === 0)
            value = value.substr(1);

        return value;
    };
    var toCamelCase = function (value) {
        value = value.replace(/\_(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });

        return value;
    };
    var toPascalCase = function (value) {
        value = value.replace(/\_(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });

        return value.slice(0, 1).toLocaleUpperCase() + value.slice(1);
    };
    var internalToggleCase = function (tagName, type) {
        switch (type.toLowerCase()) {
            case 'pascal':
                return toPascalCase(tagName);
            case 'camel':
                return toCamelCase(tagName);
            case 'snake':
                return toSnakeCase(tagName);
            default:
                return toCamelCase(tagName);
        }
    };

    function parseQueryString(queryString) {
        var obj = {};
        var keyvalue = [];
        var key = "", value = "";
        var paraString = queryString.split("&");
        for (var i = 0; i < paraString.length; i++) {
            keyvalue = paraString[i].split("=");
            key = keyvalue[0];
            value = keyvalue[1];
            obj[key] = value;
        }
        return obj;
    }

    /**
     * @param data: å¯¹è±¡ç±»åž‹
     * @param type: è¦è½¬è½¬æ¢çš„ä¹¦å†™æ ¼å¼,,    camel, snake
     */
    var toggleCase = function (data, type) {
        if (!data || typeof data !== 'object')
            return data;

        if (typeof data === 'string')
            data = JSON.parse(data);

        var tempData = {}, itemTagName = '';
        if ($.isArray(data)) {
            tempData = [];
            for (var j = 0; j < data.length; j++) {
                tempData.push(arguments.callee(data[j], type));
            }
        }
        else {
            for (var item in data) {
                if ($.isArray(data[item]) && data[item].length > 0) {
                    var tempArray = [];
                    for (var i = 0; i < data[item].length; i++) {
                        tempArray.push(arguments.callee(data[item][i], type));
                    }

                    itemTagName = internalToggleCase(item.toString(), type);
                    tempData[itemTagName] = tempArray;
                }
                else {
                    itemTagName = internalToggleCase(item.toString(), type);
                    tempData[itemTagName] = arguments.callee(data[item], type);
                }
            }
        }

        return tempData;
    };

    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (typeof options.enableToggleCase === 'undefined' || !options.enableToggleCase) {
            return;
        }
        else {
            var data = options.data;
            var toQuery = false;
            var requestCase = options.requestCase ? options.requestCase : 'snake',
                responseCase = options.responseCase ? options.responseCase : 'camel';

            var nct = typeof data == "string";
            if (nct) {
                try {
                    data = JSON.parse(data);
                }
                catch (err) {
                    if (options.type == "GET" && nct) {
                        toQuery = true;
                        data = parseQueryString(options.data);
                    }
                }
            }

            var temp = window.toggleCase(data, requestCase);
            if (nct && toQuery) {
                options.data = $.param(temp);
            }
            else if(nct) {
                options.data = JSON.stringify(temp);
            }
            else {
                options.data = temp;
            }

            options.dataFilter = function (data, type) {
                if (data && type.toLowerCase() === 'json') {
                    var nct = typeof data === "string";
                    jsonData = toggleCase(nct ? JSON.parse(data) : data, responseCase);

                    if (nct)
                        data = JSON.stringify(jsonData);
                    else
                        data = jsonData;
                }

                return data;
            }
        }
    });

    // //å¤‡ä»½jqueryçš„ajaxæ–¹æ³•
    // var _ajax = $.ajax;
    //
    // //é‡å†™jqueryçš„ajaxæ–¹æ³•
    // $.ajax = function (opt) {
    //     if (typeof opt.enableToggleCase === 'undefined' || !opt.enableToggleCase)
    //         return _ajax(opt);
    //
    //     var requestCase = opt.requestCase ? opt.requestCase : 'snake',
    //         responseCase = opt.responseCase ? opt.responseCase : 'camel';
    //
    //     if (opt && opt.data && typeof opt.data === 'string') {
    //         opt.data = JSON.stringify(toggleCase(JSON.parse(opt.data), requestCase));
    //     }
    //
    //     var fn = {
    //         dataFilter: function (data, type) {
    //             return data;
    //         }
    //     };
    //     if (opt.dataFilter) {
    //         fn.dataFilter = opt.dataFilter;
    //     }
    //
    //     var tempOpt = $.extend(opt, {
    //         dataFilter: function (data, type) {
    //             if (data && type.toLowerCase() === 'json') {
    //                 var nct = typeof data === "string";
    //                 jsonData = toggleCase(nct ? JSON.parse(data) : data , responseCase);
    //
    //                 if(nct)
    //                     data = JSON.stringify(jsonData);
    //                 else
    //                     data = jsonData;
    //             }
    //
    //             return data;
    //         }
    //     });
    //
    //     return _ajax(tempOpt);
    // };
})(jQuery);