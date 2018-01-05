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
    onBtnClick: function (m, e) {
        if (this.model.data.extra.last_study_course_id) {
            var url = ko.unwrap(typeof gaea_js_properties.front_course_url != 'undefined' ? (gaea_js_properties.front_course_url + '/' + projectCode) : this.model.host) + "/course/" + ko.unwrap(this.model.data.extra.last_study_course_id) +
                "/learn?resource_uuid=" + ko.unwrap(this.model.data.extra.last_study_resource_id) +
                "&resource_type=" + ko.unwrap(this.model.data.extra.last_study_resource_type);
            this.navigateTo(url);

            e.stopPropagation();
        }
        else {
            this.onClick(m, e);
        }
    },
    onClick: function (m, e) {
        var url = ko.unwrap(this.model.host) + "/train/" + ko.unwrap(this.model.data.unit_id);
        ;
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

ko.components.register("x-traincard", {
    viewModel: Model,
    template: tpl
})