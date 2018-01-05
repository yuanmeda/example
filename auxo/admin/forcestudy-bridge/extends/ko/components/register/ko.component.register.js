/**
 * @file: Javascript文件描述
 * @author: Administrator
 * @history: 2016/2/25
 */
;(function (koComponentRegister) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        koComponentRegister(require("knockout"));
    } else if (typeof define === 'function' && define.amd) {
        define(["knockout"], koComponentRegister);
    } else {
        window.koComponentRegister = koComponentRegister(window.ko);
    }
}(function (ko) {
    // declare all components here,
    // and use #registerComponent(name) or #registerAllComponents() to register them
    var koComponents = {
        "x-amdtest": "koComponent/amdtest/js/component",
        "x-userencourage": "koComponent/userencourage/js/userencourage"
    };

    return {
        /**
         * register component undeclared above
         * @param koComponents
         */
        register: function (koComponents) {
            for (var componentName in koComponents) {
                if (koComponents.hasOwnProperty(componentName)) {
                    ko.components.register(componentName, { require: koComponents[componentName] });
                }
            }
        },
        /**
         * register specified component declared above
         * @param name
         */
        registerComponent: function (name){
            if (koComponents[name]){
                var component = {};
                component[name] = koComponents[name];
                this.register(component);
            }
        },
        /**
         * register all component declared above
         */
        registerAllComponents: function (){
            this.register(koComponents);
        }
    };
}));