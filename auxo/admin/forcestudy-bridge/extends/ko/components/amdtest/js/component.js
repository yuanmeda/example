/**
 * @file: Javascript文件描述
 * @author: Administrator
 * @history: 2016/5/11
 */
;(function () {

    (function (koComponent) {
        if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
            koComponent(require("knockout"));
        } else if (typeof define === 'function' && define.amd) {
            define(["knockout", "text!koComponentTemplateUrl/amdtest/template"], koComponent);
        } else {
            var ko = window.ko;
            ko.components.register("x-amdtest", koComponent(ko, ""));
        }
    }(function (ko, templateHtml) {
        var viewModel = function (params) {
            params = params || {};
            this.model = {
                title: params.title || "This is body's title"
            };
        };
        viewModel.prototype = {};

        return {
            viewModel: viewModel,
            template: templateHtml ? templateHtml :
            "<!-- ko template: { nodes: $componentTemplateNodes } --><!-- /ko -->"
        };
    }))


}());