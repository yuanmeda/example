;(function ($) {
    var store = {
        getList: function (search) {
            return $.ajax({
                url: '/' + projectCode + '/v1/logs/pages',
                dataType: 'json',
                cache: false,
                data: search
            });
        }
    };
    var viewModel = {
        model: {
            search: {
                page: page ? +page : 0,
                size: size ? +size : 20,
                user_id: userId ? userId : '',
                log_start_date: logStartDate ? logStartDate : '',
                log_end_date: logEndDate ? logEndDate : '',
                ip: ip ? ip : '',
                message: message ? message : '',
                source_type: sourceType ? sourceType : '1',
                uri: uri ? uri : ''
            },
            list: {
                items: [],
                count: 0
            }
        },
        init: function () {
            var me = this,js_start=$("#startDate"),js_end=$("#endDate");
            this.model = ko.mapping.fromJS(this.model);
            this._getList();

            js_start.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                autoclose: true
            }).on('changeDate', function (ev) {
                js_end.datetimepicker('setStartDate', me.model.search.log_start_date());
            });

            js_end.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                autoclose: true
            }).on('changeDate', function (ev) {
                js_start.datetimepicker('setEndDate', me.model.search.log_end_date());
            });

            js_end.click(function(){js_end.datetimepicker('show')});
            js_start.click(function(){js_start.datetimepicker('show')});

            ko.applyBindings(this, document.getElementById('logList'));
        },
        _getList: function () {
            var self = this;
            var search = ko.mapping.toJS(self.model.search);
            search.ip = $.trim(search.ip);
            search.user_id = $.trim(search.user_id);
            search.message = $.trim(search.message);
            if (search.log_start_date) search.log_start_date = +new Date((search.log_start_date + ':00').replace(/-/g, "/"));
            if (search.log_end_date) search.log_end_date = +new Date((search.log_end_date + ':59').replace(/-/g, "/"));
            store.getList(search)
                .done(function (data) {
                    self.model.list.items(data.items);
                    self.model.list.count(data.count);
                    self._page(data.count, self.model.search.page(), self.model.search.size());
                });
        },
        search: function () {
            this.model.search.page(0);
            this._getList();
        },
        reset: function () {
            this.model.search.ip('');
            this.model.search.user_id('');
            this.model.search.message('');
            this.model.search.log_start_date('');
            this.model.search.log_end_date('');
            this.model.search.source_type('1');
            $("#endDate").datetimepicker('setStartDate', null);
            $("#startDate").datetimepicker('setEndDate', null);
            this.model.search.page(0);
            this._getList();
        },
        showAll: function (text, isShowAll, $data, event) {
            if (text == '' || text == null)return;
            if (!event) {
                return text.length > 30 ? text.substr(0, 30) + '...' : text;
            } else {
                if (text.length > 30) {
                    return isShowAll ? $(event.delegateTarget).text(text) : $(event.delegateTarget).text(text.substr(0, 30) + '...');
                }
            }
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
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
