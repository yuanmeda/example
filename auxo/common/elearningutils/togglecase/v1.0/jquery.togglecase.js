/**
 * 扩展jQuery的ajax方法，将Data参数中的命名方式转换成对应的书写格式
 * Created by LinTao on 2016/1/12.
 */
(function () {
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

        return value.slice(0,1).toLocaleUpperCase()+value.slice(1);
    };
    var internalToggleCase = function (tagName, type) {
        switch (type.toLowerCase()) {
            case 'camel':
                return toCamelCase(tagName);
            case 'snake':
                return toSnakeCase(tagName);
            default:
                return toCamelCase(tagName);
        }
    };

    /**
     * @param data: 对象类型
     * @param type: 要转转换的书写格式,,    camel, snake
     */
    var toggleCase = function (data, type) {
        if (!data || typeof data !== 'object')
            return data;

        if (typeof data === 'string')
            data = JSON.parse(data);

        var tempData = {}, itemTagName = '';
        if($.isArray(data)) {
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
                    tempData[itemTagName] = data[item];
                }
            }
        }

        return tempData;
    };

    //备份jquery的ajax方法
    var _ajax = $.ajax;

    //重写jquery的ajax方法
    $.ajax = function (opt) {
        if (typeof opt.enableToggleCase === 'undefined' || !opt.enableToggleCase)
            return _ajax(opt);

        var requestCase = opt.requestCase ? opt.requestCase : 'snake',
            responseCase = opt.reponseCase ? opt.reponseCase : 'camel';

        if (opt && opt.data && typeof opt.data === 'string') {
            opt.data = JSON.stringify(toggleCase(JSON.parse(opt.data), requestCase));
        }

        var fn = {
            dataFilter: function (data, type) {
                return data;
            }
        };
        if (opt.dataFilter) {
            fn.dataFilter = opt.dataFilter;
        }

        var tempOpt = $.extend(opt, {
            dataFilter: function (data, type) {
                if (data && type.toLowerCase() === 'json') {
                    jsonData = toggleCase(JSON.parse(data), responseCase);
                    data = JSON.stringify(jsonData);
                }

                return data;
            }
        });

        return _ajax(tempOpt);
    };
})(jQuery);
