;(function ($, window) {
    'use strict';
    var _ = ko.utils;
    // 数据仓库
    var store = {
        getPkRecord: function (data) {
            return $.ajax({
                url: '/v1/pk_records/search',
                dataType: 'json',
                data: data,
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                $filter: 'pk_id eq ' + window.pkId + ' and status in (1,2,3,4) and (challenger eq ' + window.userId + ' or defender eq ' + window.userId + ')',
                $order: 'create_time desc',
                $offset: 0,
                $limit: 20,
                $result: 'pager'
            },
            pager: {
                page_no: 0,
                page_size: 20
            },
            record: {
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
            this.getPkRecord();
        },
        getPkRecord: function () {
            var self = this, filter = this.model.filter, search = ko.mapping.toJS(filter);
            store.getPkRecord(search).done(function (res) {
                _.arrayForEach(res.items || [], function (v) {
                    v.user_me = v.challenger.user_id == window.userId ? 'challenger' : 'defender';
                    v.user_rival = v.challenger.user_id == window.userId ? 'defender' : 'challenger';
                });
                self.model.record.items(res.items);
                self.model.record.total(res.total || 0);
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
                        self.getPkRecord();
                    }
                }
            });
        },
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
