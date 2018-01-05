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
            rankings: [],
            init: false,
            //需要外面传的参数
            search: {
                tag: 'week_all_in',
                start: 1,
                rank_id: '',//外面传的参数
                show_type: 0,
                scroll_type: 1,
                class_id: '',
                update_time: ''
            }
        };
        $.extend(model.search, this.params.value);
        //model.search = this.params.value;
        this.model = ko.mapping.fromJS(model);
        this._init();
    }


    Model.prototype = {
        //数据初始化
        _init: function () {
            this._loadList();
        },
        //tab列表加载
        _loadList: function () {
            var _self = this;
            var _filter = ko.toJS(_self.model.search);
            _self.store.getRankings(_filter).done(function (rankingList) {
                if (rankingList.code == 0) {
                    _self.model.rankings(rankingList.body.data);
                } else {
                    _self.model.rankings([]);
                }
                _self.model.init(true);
                if (rankingList.body.server_time) {
                    _self.model.search.update_time($.format.date(new Date(rankingList.body.server_time.split('T')[0].replace(/-/g, '/')).getTime() - 86400000, 'yyyy-MM-dd'));
                }
            });
        },
        avatar_error_js: function (binds, e) {
            e.target.src = defaultAvatar;
        }
    };
    ko.components.register('x-week-rank', {
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
    })
})(window, jQuery);