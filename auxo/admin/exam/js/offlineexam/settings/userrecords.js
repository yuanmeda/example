(function ($, window) {
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        //获取考生考试记录
        getHistoryRecords: function (data) {
            var url = '/' + projectCode + '/v1/m/exams/' + template_id + '/users/list';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                data: data,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                exam_id: template_id || null,
                user_id: user_id || null,
                page: 0,
                size: 20
            },
            count: 0,
            items: []
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this._updateItems();
        },
        _updateItems: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            store.getHistoryRecords(filter)
                .done(function (records) {
                    this.model.items(records.items);
                    this.model.count(records.count);
                    this._pagination(this.model.count(), this.model.filter.page(), this.model.filter.size());
                }.bind(this))
        },
        _pagination: function (count, offset, limit) {
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                items_per: [20, 50, 100, 200, 500, 1000],
                callback: $.proxy(function (index) {
                    if (index != offset) {
                        this.model.filter.page(index);
                        this._updateItems();
                    }
                }, this),
                perCallback: $.proxy(function (size) {
                    this.model.filter.page(0);
                    this.model.filter.size(size);
                    this._updateItems();
                }, this)
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);