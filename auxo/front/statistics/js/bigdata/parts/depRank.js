;
(function ($, ko, global) {

    var service = {
        getRankList: function (data) {
            return $.ajax({
                url: '/v1/big_statistics/orgs/rank',
                type: 'GET',
                data: data
            });
        }
    };

    function ViewModel() {
        this.model = {
            search: {
                page: 0,
                size: global.moduleConfig.studyRankVo.statOrgNum
            },
            title: global.moduleConfig.studyRankVo.orgName || '单位排行榜',
            list: []
        };
    }

    ViewModel.prototype = {
        constructor: ViewModel,
        initViewModel: function (el) {
            this.model = ko.mapping.fromJS(this.model);
            this.getRankList();
            ko.applyBindings(this, el);
        },
        getRankList: function () {
            var that = this,
                search = ko.mapping.toJS(this.model.search);
            service.getRankList(search).then(function (data) {
                $.each(data, function (i, v) {
                    v.name = v.name || '';
                    v.period = global.utils.toFixed(v.period, 1);
                });
                that.model.list(data || []);
            });
        }
    };

    global.ready(function () {
        new ViewModel().initViewModel($('.md-capita')[0]);
    });

}(jQuery, window.ko, window.global || (window.global = {})));