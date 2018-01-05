;(function ($) {
    var store = {
        getMessageList: function (search) {
            var url = '/' + projectCode + '/recommends/messages';
            return commonJS._ajaxHandler(url,search);
        },
        deleteMessage: function (messageId) {
            var url = '/' + projectCode + '/recommends/messages/' + messageId;
            return commonJS._ajaxHandler(url, null, 'DELETE');
        }
    };
    var viewModel = {
        status: {
            '-1': '未发送',
            '0': '发送成功',
            '1': '发送失败'
        },
        model: {
            search: {
                page: 0,
                size: 20,
                title: '',
                start_time: '',
                end_time: '',
                status: ''
            },
            noticeList: [],
            count: 0
        },
        init: function () {
            var me = this;
            this.model = ko.mapping.fromJS(this.model);

            $("#startTime").datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText, inst) {
                    $("#endTime").datepicker("option", "minDate", dateText);
                    me.model.search.start_time(dateText);
                }
            });
            $("#endTime").datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText, inst) {
                    $("#startTime").datepicker("option", "maxDate", dateText);
                    me.model.search.end_time(dateText);
                }
            });

            this._getList();

            ko.applyBindings(this, document.getElementById('messageList'));
        },
        clearSearch: function () {
            this.model.search.title('');
            this.model.search.start_time('');
            this.model.search.end_time('');
            this.model.search.status('');
            $("#endTime").datepicker("option", "minDate", null);
            $("#startTime").datepicker("option", "maxDate", null);
        },
        _getList: function () {
            var self = this;
            var search = ko.mapping.toJS(self.model.search);
            search.title = $.trim(search.title);
            search.custom_type = 'auxo-operate-manage';
            if (search.start_time) search.start_time = +new Date((search.start_time + ' 00:00:00').replace(/-/g, "/"));
            if (search.end_time) search.end_time = +new Date((search.end_time + ' 23:59:59').replace(/-/g, "/"));
            store.getMessageList(search)
                .done(function (data) {
                    self.model.noticeList(data.items);
                    self.model.count(data.total);
                    self._page(self.model.count(), self.model.search.page(), self.model.search.size());
                });
        },
        search: function () {
            this.model.search.page(0);
            this._getList();
        },
        _page: function (count, offset, limit) {
            var self = this;
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        self.model.search.page(index);
                        self._getList();
                    }
                }
            });
        },
        del: function ($data) {
            var me = this;
            $.fn.dialog2.helpers.confirm("确认删除？", {
                "confirm": function () {
                    store.deleteMessage($data.id)
                        .done(function () {
                            me.model.search.page(0);
                            me._getList();
                        });
                },
                buttonLabelYes: '是',
                buttonLabelNo: '否'
            });

        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
