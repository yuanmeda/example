var i18nHelper = {
    getKeyValue: function (key, properties) {
        return i18nHelper.digui(i18n, key.split('.'), 0, properties);
    },
    digui: function(currentObj, array, currentIndex, properties) {
        //for (var i = currentIndex; i < array.length; i++) {
        //    var nameKey = array[i];
        //    var tempObj = currentObj[nameKey];
        //    if (tempObj) {
        //        switch (typeof tempObj) {
        //            case 'object':
        //                return i18nHelper.digui(tempObj, array, ++i, properties);
        //            default:
        //                for (var propery in properties) {
        //                    tempObj = tempObj.replace('{{' + propery + '}}', ko.utils.unwrapObservable(properties[propery]));
        //                }
        //                return tempObj;
        //        }
        //    }
        //    else {
        //        throw new Error('找不到指定的key:'+array.join('.'));
        //    }
        //}

        var tempObj = i18n;
        for (var i = 0; i < array.length; i++) {
            if(tempObj[array[i]]) {
                tempObj = tempObj[array[i]];
            }
            else {
                throw new Error('找不到指定的key:'+ array.join('.'));
            }
        }

        for (var propery in properties) {
            tempObj = tempObj.replace('{{' + propery + '}}', ko.utils.unwrapObservable(properties[propery]));
        }

        return tempObj;
    },
    setValue: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var namespaceArray = null;
        var mutil = null;
        var text = '';

        switch (typeof value) {
            case "object":
                if (ko.utils.unwrapObservable(value.key)) {
                    namespaceArray = ko.utils.unwrapObservable(value.key).split('.');
                    text = i18nHelper.digui(i18n, namespaceArray, 0, value.properties);
                    //(临时添加办法--判断是否为虚拟dom)
                    if (element.tagName) {
                        if (value.target) {
                            var targetProperty = '';
                            for (var i = 0; i < value.target.length; i++) {
                                targetProperty = (value.target)[i];
                                targetProperty === 'text' ? (element.tagName.toLowerCase() === 'input' ? $(element).val(text) : $(element).html(text)) : $(element).attr(targetProperty, text);
                            }
                        }
                        else {
                            element.tagName.toLowerCase() === 'input' ? $(element).val(text) : $(element).html(text);
                        }
                    } else {
                        ko.virtualElements.emptyNode(element);
                        ko.virtualElements.insertAfter(element, document.createTextNode(text));
                    }
                } else if (ko.utils.unwrapObservable(value.mutil)) {
                    mutil = ko.utils.unwrapObservable(value.mutil);
                    try{
                        for (var key in mutil) {
                            namespaceArray = mutil[key].split('.');
                            text = i18nHelper.digui(i18n, namespaceArray, 0, value.properties || {});
                            $(element).attr(key, text)
                        }
                    } catch (e) {
                        console && console.log && console.log('try-catch error');
                    }
                }
                break;
            default:
                throw new error('绑定的语法有错,正确的语法为: translate: { key: "{namespace}", properties: { "{valueKey}": "{value}" } }')
                break;
        }
    }
};

ko.bindingHandlers.translate = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        i18nHelper.setValue(element, valueAccessor, allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        i18nHelper.setValue(element, valueAccessor, allBindings, viewModel, bindingContext);
    }
};
//支持虚拟dom语法
ko.virtualElements.allowedBindings.translate = true;
