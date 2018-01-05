(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        query: {
            configs: function (data) {
                var url = '/v1/open_courses/configs';
                return $.ajax({
                    url: url,
                    cache: false,
                    data: data,
                    type: 'GET',
                    dataType: 'json'
                });
            }
        },
        put: {
            configs: function (data) {
                var url = '/v1/open_courses/configs?business_id=' + data.business_id + '&business_type=' + data.business_type + '&item_key=' + data.item_key;
                return $.ajax({
                    url: url,
                    data: JSON.stringify({
                        item_value: data.item_value
                    }),
                    contentType: 'application/json',
                    type: 'PUT',
                    dataType: 'json',
                    cache: false
                });
            }
        },
        post: {
            configs: function (data) {
                var url = '/v1/open_courses/configs';
                return $.ajax({
                    url: url,
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    type: 'POST',
                    dataType: 'json',
                    cache: false
                });
            }
        }
    };
    //课程列表数据模型
    var viewModel = {
        model: {
            filter: {
                business_id: projectId,
                business_type: 0,
                item_key: "can_upload"
            },
            value: false,
            hasConfig: false,
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, $(".container-fluid")[0]);
            this.initConfig();
        },
        initConfig: function () {
            var data = ko.mapping.toJS(this.model.filter);
            store.query.configs(data).done($.proxy(function (data) {
                if (data && data.length > 0) {
                    if (data[0].item_value == "fasle")
                        this.model.value(false);
                    if (data[0].item_value == "true")
                        this.model.value(true);

                    this.model.hasConfig(true);
                }
            }, this));
        },
        save: function () {
            var data = ko.mapping.toJS(this.model.filter);
            data.item_value = this.model.value().toString();
            if (this.model.hasConfig()) {
                store.put.configs(data);
            } else {
                store.post.configs(data);
            }
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);
