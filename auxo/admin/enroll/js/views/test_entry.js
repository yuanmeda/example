(function ($, window) {
    var _ = ko.utils;
    var store = {
        create: function (data) {
            return $.ajax({
                url: '/v1/learning_units',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data)
            });
        }
    };

    var viewModel = {
        model: {
            unit_id: '',
            return_url: '',
            urls: {
                enroll: '',
                setting: '',
                manage: ''
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.unit_id.subscribe(function () {
                this.setUrls();
            }, this);
            this.model.return_url.subscribe(function () {
                this.setUrls();
            }, this);
            ko.applyBindings(this);
        },
        create: function () {
            var self = this;
            store.create({type: 'test-enroll'}).done(function (data) {
                self.model.unit_id(data.unit_id);
            });
        },
        setUrls: function () {
            var unit_id = this.model.unit_id(), return_url = this.model.return_url();
            var url_prefix = 'http://' + window.location.host + '/course/' + project_code + '/enroll';
            this.model.urls.enroll('http://' + window.location.host + '/course/' + project_code + '/enroll/enroll?unit_id=' + unit_id + '&__return_url=' + encodeURIComponent(return_url));
            this.model.urls.setting(url_prefix + '/setting?unit_id=' + unit_id + '&__return_url=' + encodeURIComponent(return_url));
            this.model.urls.manage(url_prefix + '/manage?unit_id=' + unit_id + '&__return_url=' + encodeURIComponent(return_url));
        },
        router: function (route) {
            if (this.model.unit_id())window.open(this.model.urls[route]());
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
