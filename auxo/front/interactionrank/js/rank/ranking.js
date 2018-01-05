
var viewModel = {
    //我的学习model定义
    model: {
        currentUserInfo: {
            userId: currentUserId,
            rankTypeKey: 'myRankingList.frontPage.7ds',
            rank: '--',
            minutes: '--',
            exceed: '--'
        },
        rankings: [],
        search: {
            tag: 'week_all_in',//当前选中的榜单 例如：周榜 week_all_in ，月榜 month_all_in，总榜 all_in
            start: 1,//start 开始位置，每页条数由服务端配置 --可选，默认值为 1
            rank_id: 'learnHoursSumTabs',// 如果业务方没传，默认为组件的（compentMainTabs）
            show_type: 0,// 显示类型 --可选,0:普通 1:瀑布流
            class_id: 1200 - 'train' - 104,//project_id - type -object_id   type类型 公开课：singlecourse，培训：train，职业规划：job，云课：cloudcourse ，对象ID 比如课程id,培训ID
            scroll_type: 1,//滚动类型：向上滚=-1 向下滚=1 ---可选,默认值向下滚1
            update_time:'2017-05-45'//排行资源更新时间
        }
    },
    //数据初始化
    _init: function () {
        viewModel.model = ko.mapping.fromJS(viewModel.model);
        ko.applyBindings(this);
    }
};

$(function () {
    viewModel._init();
});
