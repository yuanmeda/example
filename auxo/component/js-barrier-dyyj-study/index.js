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
        this.model.proceed_url = params.proceed_url;
    },
    onClick: function (m, e) {
        var item = m.model.data;
        var url = this.model.proceed_url.replace('{exam_id}',ko.unwrap(item.unit_info.unit_id));
        var href = url.replace('{barrier_name}',ko.unwrap(item.unit_info.title));
        var w = window.open();
        w.location.href = href;
        e.stopPropagation();
    }
}

ko.components.register("x-barrier", {
    viewModel: Model,
    template: tpl
})