/**
 * 评价列表
 * @author wlj
 */
(function (w, $) {
    function Model(params) {
        this.params = params;
        this.store = {
            getRankings: function (searchObj) {
                var url = (window.selfUrl || '') + '/' + params.projectCode + '/ranks/perrank';
                return $.ajax({
                    url: url,
                    cache: false,
                    dataType: 'json',
                    type: "GET",
                    data: searchObj
                });
            }
        };
        var model = {
            currentUserInfo: {
                userId: '',
                rankTypeKey: 'rankComponent.frontPage.7ds',
                rank: '--',
                minutes: '--',
                exceed: '--'
            },
            rankings: [],
            //需要外面传的参数
            search: {
                tag: 'week_all_in',
                start: 1,
                rank_id: '', //外面传的参数
                show_type: 0,
                scroll_type: 1
            },
            status: {
                hasNext: true,
                loading: false
            }
        };
        $.extend(model.search, this.params.value || {});
        this.model = ko.mapping.fromJS(model);
        this._init();
    }


    Model.prototype = {
        //数据初始化
        _init: function () {
            this._loadList(false);
        },
        //tab列表加载
        _loadList: function (loadMore) {
            var _self = this;
            _self.model.status.loading(true);
            var _filter = ko.toJS(_self.model.search);
            _self.store.getRankings(_filter).done(function (data) {
                var rankingList = data.body, code = data.code;
                if (!code) {
                    var temp = _self.model.rankings();
                    if (rankingList && rankingList.data && rankingList.data.length > 0) {
                        if (loadMore) {
                            [].push.apply(temp, rankingList.data);
                        } else {
                            if (rankingList.user_info) {
                                _self.model.currentUserInfo.rank(rankingList.user_info.rank);
                                _self.model.currentUserInfo.minutes(parseInt(rankingList.user_info.my_score));
                                _self.model.currentUserInfo.exceed(rankingList.user_info.score_rate ? rankingList.user_info.score_rate + '%' : '0');
                                _self.model.currentUserInfo.userId(rankingList.current_user_id);
                            } else {
                                _self.model.currentUserInfo.rank('--');
                                _self.model.currentUserInfo.minutes('--');
                                _self.model.currentUserInfo.exceed('--');
                            }
                            temp = rankingList.data;
                        }
                    } else {
                        _self.model.currentUserInfo.rank('--');
                        _self.model.currentUserInfo.minutes('--');
                        _self.model.currentUserInfo.exceed('--');
                        temp = [];
                    }
                    _self.model.rankings(temp);
                    if (rankingList.is_last_page) {
                        _self.model.status.hasNext(false);
                    }
                    _self.model.status.loading(false);
                } else {
                    _self.model.status.loading(false);
                }

            });
        },
        //加载更多
        loadMoreAction: function () {
            this.model.search.start(this.model.search.start() + 10);
            this._loadList(true);
        },
        avatar_error_js: function (binds, e) {
            e.target.src = 'http://cs.101.com/v0.1/static/cscommon/avatar/default/default.jpg?size=80';
        },
        //点击tab页触发
        tabHandlerAction: function (element, rankType) {
            if ($(element).hasClass('active')) {
                return;
            }
            $(element).addClass('active').siblings().removeClass('active');
            this.model.search.tag(rankType);
            this.model.rankings([]);
            this.model.currentUserInfo.rankTypeKey("rankComponent.frontPage." + (rankType == 'week_all_in' ? '7ds' : (rankType == 'month_all_in' ? '30ds' : 'all')));
            this.model.search.start(1);
            this.model.status.hasNext(true);
            this.model.status.loading(true);
            this._loadList(false);
        }
    };
    ko.components.register('x-project-rank', {
        /**
         * 组件viewModel类
         *
         * @class
         * @param params 组件viewModel实例化时的参数
         */
        viewModel: Model,
        /**
         * 组件模板
         */
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(window, jQuery);
