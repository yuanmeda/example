;(function ($) {
    var store = {
        getList: function (search) {
            return $.ajax({
                url: '/' + projectCode + '/v1/recommends/point_experiences',
                dataType: 'json',
                cache: false,
                data: search
            });
        }
    };
    var viewModel = {
        model: {
            search: {
                page: 0,
                size: 20,
                operate_user_name: '',
                start_time: '',
                end_time: '',
                reward_user_name: ''
            },
            list: [],
            count: 0
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this._getList();
            var me = this;
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
            ko.applyBindings(this, document.getElementById('experienceList'));
        },
        clearSearch: function () {
            this.model.search.operate_user_name('');
            this.model.search.start_time('');
            this.model.search.end_time('');
            this.model.search.reward_user_name('');
            $("#endTime").datepicker("option", "minDate", null);
            $("#startTime").datepicker("option", "maxDate", null);
            this._getList();
        },
        _getList: function () {
            var self = this;
            var search = ko.mapping.toJS(self.model.search);
            search.reward_user_name = $.trim(search.reward_user_name);
            search.operate_user_name = $.trim(search.operate_user_name);
            if (search.start_time) search.start_time = search.start_time + ' 00:00:00';
            if (search.end_time) search.end_time = search.end_time + ' 23:59:59';
            store.getList(search)
                .done(function (data) {
                    self.model.list(data.items);
                    self.model.count(data.count);
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
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
