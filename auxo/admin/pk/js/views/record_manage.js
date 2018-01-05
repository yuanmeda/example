;(function ($, window) {
    'use strict';
    var _ = ko.utils;
    // 数据仓库
    var store = {
        getPkUser: function (data) {
            return $.ajax({
                url: '/v1/pk_users/search',
                dataType: 'json',
                data: data,
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                $filter: 'pk_id eq ' + window.pkId,
                $offset: 0,
                $limit: 20,
                $result: 'pager',
            },
            pager: {
                page_no: 0,
                page_size: 20
            },
            users: {
                items: [],
                total: 0
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.pager.page_no.subscribe(function (v) {
                this.model.filter.$offset(v * this.model.filter.$limit());
            }, this);
            ko.applyBindings(this, document.getElementById('container'));
            this.getPkUser();
        },
        search: function () {
            this.model.pager.page_no(0);
            this.getPkUser();
        },
        getPkUser: function () {
            var self = this, filter = this.model.filter, search = ko.mapping.toJS(filter);
            store.getPkUser(search).done(function (res) {
                self.model.users.items(res.items);
                self.model.users.total(res.total || 0);
                self.pagination(res.total || 0);
            })
        },
        formatTime: function (time) {
            return $.format.date(time, 'yyyy-MM-dd HH:mm:ss');
        },
        pagination: function (totalCount) {
            var pager = this.model.pager, self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: pager.page_size(),
                num_display_entries: 5,
                current_page: pager.page_no(),
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (page_no) {
                    if (page_no != pager.page_no()) {
                        pager.page_no(page_no);
                        self.getPkUser();
                    }
                }
            });
        },
        formatDuration: function (time) {
            if (!time && time !== 0)return time;
            var hour = ~~(time / 60 / 60 );
            var minite = ~~((time - hour * 60 * 60 ) / 60 );
            var second = ~~((time - hour * 60 * 60 - minite * 60 ));
            return (hour < 10 ? '0' + hour : hour) + ':' + (minite < 10 ? '0' + minite : minite) + ':' + (second < 10 ? '0' + second : second);
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
