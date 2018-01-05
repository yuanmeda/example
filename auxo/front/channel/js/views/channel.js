;(function ($, window) {
    'use strict';
    var _ = ko.utils;
    var viewModel = {
        model: {},
        init: function () {
            var groupNames = _.arrayMap(window.allGroupNames || [], function (v) {
                return v.name;
            })
            this.setting = {
                "data": {
                    "group_names": groupNames,  //学习单元分组列表
                    "tag_id": tag_id.split(',') || [], //标签id（为空，表示显示资源池下的所有资源）
                },
                "display": {
                    "is_tag_show": true,   //是否在资源上方显示标签
                    "is_sort_enabled": true,   //是否开启排序功能
                    "order_type": parseInt(order_type) || 3,  //默认排序方式（is_sort_enabled为true时有效） 1最新 2最热 3推荐
                    "is_filter_enabled": true,   //是否开启资源筛选
                    "filter_type": 2,  //默认过滤方式（is_filter_enabled为true时有效） 0全部 2进行中 1即将开始 3已结束
                }
            };
            ko.applyBindings(this, document.getElementById('channelContainer'));
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);