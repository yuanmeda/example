;(function ($, window) {
    'use strict';
    var _ = ko.utils;
    var store = {
        getPkUser: function (data) {
            return $.ajax({
                url: window.self_host + '/v1/pk_users',
                dataType: 'json',
                data: data,
                cache: false
            });
        },
        getPkRecord: function (data) {
            return $.ajax({
                url: window.self_host + '/v1/pk_records/search',
                dataType: 'json',
                data: data,
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                $filter: 'pk_id eq ' + window.pkId + ' and status in (1,2,3,4)',
                $order: 'create_time desc',
                $offset: 0,
                $limit: 10,
                $result: 'pager'
            },
            user: null,
            record: {
                items: [],
                total: 0
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('container'));
            this.getPkUser();
            this.initScroller();
        },
        initScroller: function () {
            var self = this;
            $(window).on('scroll', function (e) {
                if (!self.isSending && self.model.record.items().length < self.model.record.total() && ($(window).height() + $(window).scrollTop() >= $(document).height())) {
                    var offset = self.model.filter.$offset;
                    offset(offset() + self.model.filter.$limit());
                    self.getPkRecord();
                }
            })
        },
        getPkUser: function () {
            var self = this, $filter = this.model.filter.$filter;
            store.getPkUser({'pk_id': window.pkId}).done(function (res) {
                self.model.user(res || null);
                $filter($filter() + ' and (challenger eq ' + res.uc_user_display_facade.user_id + ' or defender eq ' + res.uc_user_display_facade.user_id + ')')
                self.getPkRecord();
            })
        },
        getPkRecord: function () {
            var self = this, user = self.model.user(), filter = this.model.filter, search = ko.mapping.toJS(filter);
            this.isSending = true;
            search.$filter = encodeURIComponent(search.$filter);
            search.$order = encodeURIComponent(search.$order);
            store.getPkRecord(search).done(function (res) {
                var results = self.model.record.items().concat(res.items || []);
                _.arrayForEach(results, function (v, i) {
                    v.user_me = v.challenger.user_id == user.uc_user_display_facade.user_id ? 'challenger' : 'defender';
                    v.user_rival = v.challenger.user_id == user.uc_user_display_facade.user_id ? 'defender' : 'challenger';
                    var showTime = $.format.date(v.create_time, 'MM-dd');
                    if (!i) {
                        v.record_show_time = showTime;
                    } else {
                        if (showTime === $.format.date(results[i - 1].create_time, 'MM-dd'))
                            v.record_show_time = '';
                        else
                            v.record_show_time = $.format.date(v.create_time, 'MM-dd')
                    }
                });
                self.model.record.items(results);
                self.model.record.total(res.total || 0);
            }).always(function () {
                self.isSending = false;
            })
        },
        formatStatusClass: function ($data) {
            var STATUS_MAP = {
                '1': 'waiting-situ',
                '2': 'win-situ',
                '3': 'fail-situ',
                '4': 'tie-situ',
            };
            if ($data.user_me == 'challenger') {
                return STATUS_MAP[$data.status];
            } else {
                if ($data.status == 1)return 'waitingme-situ';
                if ($data.status == 2)return 'fail-situ';
                if ($data.status == 3)return 'win-situ';
                if ($data.status == 4)return 'tie-situ';
            }
        },
        formatWaitingText: function ($data) {
            if ($data.user_me == 'defender') {
                if ($data.challenger_pk_answer.status == 0) {
                    return 'pkComponent.record.waitingMeNotReady';
                } else {
                    return 'pkComponent.record.waitingMe';
                }
            } else {
                return 'pkComponent.record.waiting';
            }
        },
        hrefTo: function ($data) {
            if ($data.status == 2 || $data.status == 3 || $data.status == 4) {
                location.href = window.self_host + '/' + window.projectCode + '/pk/' + window.pkId + '/record/' + $data.id + '/result'
            } else {
                if ($data.user_me == 'challenger') {
                    location.href = window.self_host + '/' + window.projectCode + '/pk/' + window.pkId + '/record/' + $data.id + '/result'
                } else {
                    if ($data.challenger_pk_answer.status != 0) {
                        location.href = window.self_host + '/' + window.projectCode + '/pk/' + window.pkId + '/answer?rival_id=' + $data[$data.user_rival].user_id
                    }
                }
            }
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
