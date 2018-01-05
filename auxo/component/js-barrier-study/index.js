import tpl from './template.html'
import ko from 'knockout'

function Model(params) {
    this.model = {
        "data": null,
        "host": "",
        "openType": "_self"
    }
    this.init(params);
}

Model.prototype = {
    init: function (params) {
        this.model.data = params.model;
        this.model.host = params.host;
        this.model.openType = params.openType ? params.openType : "_self";
    },
    onClick: function (m, e) {
        var item = m.model.data;
        var url = window.selfUrl + '/' + projectCode + '/mystudy/barrier?barrierId=' + item.unit_info.unit_id + '&barrierName=' + item.unit_info.title;
        this.navigateTo(url);
        e.stopPropagation();
    },
    navigateTo: function (url) {
        switch (this.model.openType) {
            case "_blank":
                window.open(url);
                break;
            default:
                window.top.location.href = url;
                break;
        }
    }
}

ko.components.register("x-barrier", {
    viewModel: Model,
    template: tpl
})