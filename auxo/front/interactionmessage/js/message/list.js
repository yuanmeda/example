var viewModel = {
    //数据初始化
    model: {
        count_no_read:0
    },
    _init: function () {
        this.model = ko.mapping.fromJS(this.model);
        ko.applyBindings(this);
    }
};

$(function () {
    viewModel._init();
});
