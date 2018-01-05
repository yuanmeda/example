(function () {
    'use strict';
    var i18n = {},
        namespace = "i18n";
    window.i18n = window.i18n || {};
    i18n.ns = window.i18n;
    i18n.fallbacks = [];
    var own = Object.hasOwnProperty;
    i18n.regexEscape = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    i18n.interpolationPrefix = i18n.regexEscape("{{");
    i18n.interpolationSuffix = i18n.regexEscape("}}");
    i18n.transition = function (key, properties) {
        if (typeof key !== "string")
            throw new Error("key is not string");
        key = key.split('.');
        var transition = i18n.ns;
        for (var i = 0, len = key.length; i < len; i++) {
            var v = key[i],
                transition = transition[v];
            if (!transition) break;
        }
        if (properties && properties.toString() == "[object Object]") {
            for (var key in properties) {
                if (!own.call(properties, key)) continue;
                var value = properties[key],
                    rs = i18n.interpolationPrefix + key + i18n.interpolationSuffix;
                var regex = new RegExp(rs, 'g');
                transition = transition.replace(regex, value);
            }
        }
        if (!transition) throw new Error( key + "is not define");
        return transition;
    };
    i18n.prepend = function (element, text) {
        var childElems  = ko.utils.parseHtmlFragment(text)
        ko.virtualElements.setDomNodeChildren(element, childElems);
    }
    var bindingHandlers = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            i18n.fallbacks.push(ko.bindingHandlers['translate'].update.bind(undefined, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext));
            //bindingHandlers.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.toJS(valueAccessor()),
                text;
            if (typeof value === "string") {
                i18n.prepend(element, i18n.transition(value));
            } else if (value.key) {
                text = i18n.transition(value.key, value.properties);
                value.target = value.target || ['html'];
                var len = value.target.length
                while (len) {
                    var attr = value.target[len - 1];
                    if (attr === "html")
                        i18n.prepend(element, text);
                    else if (attr === "text") {
                        var te = document.createTextNode(text);
                        i18n.prepend(element, te);
                    }
                    else
                        element.setAttribute(attr, text);
                    --len;
                }
            } else {
                for (var attr in value) {
                    var option = value[attr];
                    if (!own.call(value, attr) || !option) continue;
                    if (typeof option === "string")
                        text = i18n.transition(option);
                    else {
                        text = i18n.transition(option.key, option.properties)
                    }
                    if (attr === "html") {
                        i18n.prepend(element, text);

                    } else if (attr === "text") {
                        var te = document.createTextNode(text);
                        i18n.prepend(element, te);
                    } else {
                        element.setAttribute(attr, text);
                    }
                }
            }

        }
    };
    ko.bindingHandlers.translate = bindingHandlers;
    ko.virtualElements.allowedBindings.translate = true;
    window.i18nHelper = {
        getKeyValue: i18n.transition,
        t: i18n.transition
    }
})();