;(function () {

    "use strict";

    (function (viewModelFn) {
        if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
            viewModelFn(require("knockout"), require("koMapping"));
        } else if (typeof define === 'function' && define.amd) {
            define(["knockout", "koMapping", "koComponent/register/ko.component.register"], function (ko, koMapping, koComponentRegister) {
                koComponentRegister.registerComponent("x-amdtest");
                return viewModelFn(ko, koMapping);
            });
        } else {
            var ko = window.ko;
            viewModelFn(ko, ko.mapping).initViewModel();
        }
    }(function (ko, koMapping) {

        return {
            model: {

            },
            /**
             * 初始化viewModel
             */
            initViewModel: function () {
                this.model = koMapping.fromJS(this.model);
                ko.applyBindings(this, $("#js_fs_body")[0]);
            }
        };

    }));
}());