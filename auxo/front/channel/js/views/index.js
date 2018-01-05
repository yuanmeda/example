;(function ($, window) {
    'use strict';
    var _ = ko.utils, _getKeyValue = i18nHelper.getKeyValue;
    //数据仓库
    var store = {
        //获取板块信息
        getSection: function () {
            return $.ajax({
                url: selfUrl + '/' + projectCode + '/channels/' + channelId + '/sections',
                data: {query_type: window.queryType},
                dataType: 'json',
                cache: false
            });
        },
        getTags: function () {
            return $.ajax({
                url: selfUrl + "/" + projectCode + "/channels/" + channelId + "/tags/tree",
                dataType: "json",
                cache: false
            });
        },
        // 推荐列表数据
        getRecommend: function (rule_id, page_no, page_size) {
            return $.get(window.auxoRecommendGwHost + '/v1/recommends/rules/' + rule_id, {
                user_id: window.userInfo.user_id,
                page_no: page_no,
                page_size: page_size
            })
        },
        getIsNewUser: function () {
            // 未登录
            if (!window.userInfo.user_id) {
                return $.Deferred().resolve(false);
            }
            // 已登录
            var cached = getIsNewCache();
            if (cached === false) {
                return $.Deferred().resolve(false);
            }
            return $.ajax({
                url: selfUrl + '/' + projectCode + '/accounts/isnew',
                type: 'GET',
                dataType: 'json',
                cache: false
            }).pipe(function (res) {
                setIsNewCache(res);
                return res;
            });
        }
    };
    //课程列表数据模型
    var viewModel = {
        model: {
            sections: [],
            state: {
                showHobbyTags: false,
                init: false
            },
            tags: null,
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.tags = ko.observable(null).publishOn('TAG');
            this.actions = {
                'GET_TAG': ko.observable(null).subscribeTo('GET_TAG', this.getTags, this),
            };
            this.model.state.init = ko.observable().publishOn('INIT');
            ko.applyBindings(this, document.getElementById('channelContainer'));
            this.getSection();
        },
        getTags: function () {
            if (this.loadingTag) return;
            var self = this;
            this.loadingTag = true;
            store.getTags().done(function (res) {
                self.model.tags(res);
            });
        },
        reloadRecommend: function (data) {
            var page_no = data.__page_no + 1;
            if (page_no > data.__total_pages()) {
                page_no = 0;
            }
            store.getRecommend(data.__rule.rule_id, page_no, data.__page_size)
                .then(function (res) {
                    data.recommend_data_list(res.items);
                    data.__page_no = page_no;
                    setLazyLoad(data.id);
                });
        },
        getSection: function () {
            var self = this;
            store.getSection().done(function (res) {
                var recommend_request = [];
                var data = _.arrayMap(res, function (v) {
                    if (v.type == 2) {
                        var setting = v.setting.display.web;
                        var total = (+setting.column_num - (setting.ad_enable && setting.ad_logo ? 1 : 0)) * (+setting.row_num);
                        v.window_data_list = v.window_data_list || [];
                        v.window_data_list.length = v.window_data_list.length > total ? total : v.window_data_list.length;
                    }
                    if (v.type == 6) {
                        var rule, page_size, def;
                        v.__total_pages = ko.observable();
                        v.recommend_data_list = ko.observableArray([]);
                        v.__page_no = 0;
                        rule = findRule(v.setting.data.rules);
                        v.__rule = rule;
                        if (rule === null) {
                            def = $.Deferred().resolve();
                        } else {
                            page_size = (+v.setting.display.web.column_num) * (+v.setting.display.web.row_num);
                            v.__page_size = page_size;
                            def = store.getRecommend(rule.rule_id, 0, page_size)
                                .pipe(function (res) {
                                    v.recommend_data_list(res.items);
                                    v.__total_pages(Math.ceil(res.total / page_size) - 1);
                                });
                        }
                        recommend_request.push(def);
                    }
                    return v;
                });

                $.when.apply($, recommend_request)
                    .pipe(function () {
                        self.model.sections(data);
                        self.model.state.init(true);
                        setLazyLoad('channelContainer');
                    });
                self.handleHobbyTags();
            })
        },
        handleHobbyTags: function () {
            var self = this;
            store.getIsNewUser()
                .then(function (res) {
                    self.model.state.showHobbyTags(res);
                });
        },
        formatTime: function (time) {
            return time ? time.split('.')[0].replace('T', ' ') : '';
        }
    };
    $(function () {
        viewModel.init();
    });

    function setLazyLoad(id) {
        $('#' + id + ' .lazy-image:not(.loaded)').lazyload({
            placeholder: defaultImage,
            load: function () {
                $(this).addClass('loaded');
            }
        }).trigger('scroll');
    }

    function findRule(rules) {
        var i = 0, ln = rules.length;
        for (; i < ln; i++) {
            if (rules[i].status) {
                return rules[i]
            }
        }
        return null;
    }

    function getIsNewCache() {
        if (!window.localStorage) {
            return null;
        }
        var isNew = JSON.parse(window.localStorage.getItem('IS_NEW_USER_' + projectCode + '_' + window.userInfo.user_id));
        if (isNew === null) {
            return null;
        }
        return isNew;
    }

    function setIsNewCache(res) {
        if (!window.localStorage) {
            return;
        }
        window.localStorage.setItem('IS_NEW_USER_' + projectCode + '_' + window.userInfo.user_id, res);
    }
})(jQuery, window);